<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  import { apiUrl } from '$lib/config';
  import { VALIDATION_CONSTRAINTS } from '@rogers-park/shared';

  export let data: PageData;

  let tokenValid: boolean | null = null;
  let validating = true;
  let submitting = false;
  let error = '';
  let newPassword = '';
  let confirmPassword = '';
  let passwordError = '';

  onMount(async () => {
    if (!data.token) {
      tokenValid = false;
      validating = false;
      return;
    }

    // Validate the token
    try {
      const response = await fetch(apiUrl(`/api/v1/auth/validate-reset-token/${data.token}`));
      const result = await response.json();

      if (response.ok && result.data?.valid) {
        tokenValid = true;
      } else {
        tokenValid = false;
        error = 'Invalid or expired reset token';
      }
    } catch (err) {
      tokenValid = false;
      error = 'Failed to validate token';
    } finally {
      validating = false;
    }
  });

  function validatePasswords(): boolean {
    passwordError = '';

    if (newPassword.length < VALIDATION_CONSTRAINTS.PASSWORD_MIN_LENGTH) {
      passwordError = `Password must be at least ${VALIDATION_CONSTRAINTS.PASSWORD_MIN_LENGTH} characters`;
      return false;
    }

    if (newPassword !== confirmPassword) {
      passwordError = 'Passwords do not match';
      return false;
    }

    return true;
  }

  async function handleSubmit() {
    if (!validatePasswords()) {
      return;
    }

    submitting = true;
    error = '';

    try {
      const response = await fetch(apiUrl('/api/v1/auth/reset-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: data.token,
          newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Success - redirect to login
        goto('/login?message=Password reset successful');
      } else {
        error = result.error?.message || 'Failed to reset password';
        tokenValid = false;
      }
    } catch (err) {
      error = 'An error occurred. Please try again.';
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Reset Password - Rogers Park Community</title>
</svelte:head>

<div class="reset-password-page">
  <div class="reset-password-card">
    <h1>Reset Password</h1>

    {#if validating}
      <div class="loading">
        <p>Validating reset token...</p>
      </div>
    {:else if !data.token || tokenValid === false}
      <div class="error-state">
        <div class="error">
          {error || 'Invalid or missing reset token'}
        </div>
        <p class="help-text">
          The password reset link is invalid or has expired.
        </p>
        <a href="/forgot-password" class="link-button">
          Request a new password reset
        </a>
      </div>
    {:else if tokenValid === true}
      <p class="subtitle">Enter your new password</p>

      {#if error}
        <div class="error">
          {error}
        </div>
      {/if}

      <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
          <label for="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            bind:value={newPassword}
            required
            minlength={VALIDATION_CONSTRAINTS.PASSWORD_MIN_LENGTH}
            disabled={submitting}
          />
          <small>At least {VALIDATION_CONSTRAINTS.PASSWORD_MIN_LENGTH} characters</small>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            bind:value={confirmPassword}
            required
            disabled={submitting}
          />
        </div>

        {#if passwordError}
          <div class="error">
            {passwordError}
          </div>
        {/if}

        <button type="submit" class="submit-button" disabled={submitting}>
          {submitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    {/if}
  </div>
</div>

<style>
  .reset-password-page {
    max-width: 400px;
    margin: 2rem auto;
  }

  .reset-password-card {
    background: white;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  h1 {
    margin: 0 0 0.5rem 0;
    font-size: 1.75rem;
  }

  .subtitle {
    margin: 0 0 2rem 0;
    color: #666;
  }

  .loading {
    text-align: center;
    padding: 2rem 0;
    color: #666;
  }

  .error-state {
    text-align: center;
  }

  .error {
    background: #fee;
    color: #c00;
    padding: 0.75rem;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
  }

  .help-text {
    color: #666;
    margin-bottom: 1.5rem;
  }

  .link-button {
    display: inline-block;
    background: #0066cc;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.25rem;
    text-decoration: none;
    font-weight: 600;
  }

  .link-button:hover {
    background: #0052a3;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    font-size: 1rem;
    box-sizing: border-box;
  }

  input:focus {
    outline: none;
    border-color: #0066cc;
  }

  input:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }

  small {
    display: block;
    margin-top: 0.25rem;
    color: #666;
    font-size: 0.875rem;
  }

  .submit-button {
    width: 100%;
    background: #0066cc;
    color: white;
    border: none;
    padding: 0.75rem;
    border-radius: 0.25rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
  }

  .submit-button:hover:not(:disabled) {
    background: #0052a3;
  }

  .submit-button:disabled {
    background: #999;
    cursor: not-allowed;
  }
</style>
