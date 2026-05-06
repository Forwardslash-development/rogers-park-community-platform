<script lang="ts">
  import type { ActionData } from './$types';
  
  export let form: ActionData;
</script>

<svelte:head>
  <title>Forgot Password - Rogers Park Community</title>
</svelte:head>

<div class="forgot-password-page">
  <div class="forgot-password-card">
    <h1>Forgot Password</h1>
    <p class="subtitle">Enter your email to receive a password reset link</p>

    {#if form?.error}
      <div class="error">
        {form.error}
      </div>
    {/if}

    {#if !form?.success}
      <form method="POST">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form?.email || ''}
            required
          />
        </div>

        <button type="submit" class="submit-button">
          Send Reset Link
        </button>
      </form>

      <p class="login-link">
        <a href="/login">Back to Login</a>
      </p>
    {:else}
      <div class="success">
        <p class="success-message">
          If an account exists with this email, we've sent a password reset link.
        </p>
        <p class="success-hint">
          Check your email and click the link to reset your password.
        </p>
        <a href="/login" class="return-button">Return to Login</a>
      </div>
    {/if}
  </div>
</div>

<style>
  .forgot-password-page {
    max-width: 400px;
    margin: 2rem auto;
  }

  .forgot-password-card {
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

  .error {
    background: #fee;
    color: #c00;
    padding: 0.75rem;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
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

  .submit-button:hover {
    background: #0052a3;
  }

  .login-link {
    margin-top: 1.5rem;
    text-align: center;
    color: #666;
  }

  .login-link a {
    color: #0066cc;
    text-decoration: none;
  }

  .success {
    text-align: center;
  }

  .success-message {
    color: #0a0;
    font-weight: 500;
    margin-bottom: 1rem;
  }

  .success-hint {
    color: #666;
    margin-bottom: 1.5rem;
  }

  .return-button {
    display: inline-block;
    background: #0066cc;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.25rem;
    text-decoration: none;
    font-weight: 600;
  }

  .return-button:hover {
    background: #0052a3;
  }
</style>
