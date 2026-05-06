<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { apiUrl } from '$lib/config';

  let status: 'loading' | 'success' | 'error' = 'loading';
  let message = '';

  onMount(async () => {
    const token = $page.url.searchParams.get('token');

    if (!token) {
      status = 'error';
      message = 'Invalid verification link';
      return;
    }

    try {
      const response = await fetch(apiUrl('/api/v1/auth/verify-email'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (response.ok) {
        status = 'success';
        message = result.data.message || 'Email verified successfully!';
      } else {
        status = 'error';
        message = result.error?.message || 'Email verification failed';
      }
    } catch (err) {
      status = 'error';
      message = 'Failed to verify email. Please try again.';
    }
  });
</script>

<svelte:head>
  <title>Verify Email - Rogers Park Community</title>
</svelte:head>

<div class="verify-email-page">
  <div class="verify-email-card">
    {#if status === 'loading'}
      <div class="loading">
        <h1>Verifying your email...</h1>
        <p>Please wait while we verify your email address.</p>
      </div>
    {:else if status === 'success'}
      <div class="success">
        <h1>✓ Email Verified!</h1>
        <p class="message">{message}</p>
        <p class="help-text">You can now access all features.</p>
        <a href="/dashboard" class="action-button">
          Go to Dashboard
        </a>
      </div>
    {:else}
      <div class="error-state">
        <h1>Email Verification Failed</h1>
        <div class="error">
          {message}
        </div>
        <p class="help-text">
          The verification link may have expired or is invalid.
        </p>
        <a href="/resend-verification" class="action-button">
          Resend Verification Email
        </a>
      </div>
    {/if}
  </div>
</div>

<style>
  .verify-email-page {
    max-width: 500px;
    margin: 2rem auto;
  }

  .verify-email-card {
    background: white;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  h1 {
    margin: 0 0 1rem 0;
    font-size: 1.75rem;
  }

  .loading {
    padding: 2rem 0;
    color: #666;
  }

  .success h1 {
    color: #0a0;
  }

  .message {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }

  .help-text {
    color: #666;
    margin-bottom: 2rem;
  }

  .error-state h1 {
    color: #c00;
  }

  .error {
    background: #fee;
    color: #c00;
    padding: 0.75rem;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
  }

  .action-button {
    display: inline-block;
    background: #0066cc;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.25rem;
    text-decoration: none;
    font-weight: 600;
  }

  .action-button:hover {
    background: #0052a3;
  }
</style>
