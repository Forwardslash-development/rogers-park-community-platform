<script lang="ts">
  import type { PageData, ActionData } from './$types';
  
  export let data: PageData;
  export let form: ActionData;
</script>

<svelte:head>
  <title>Resend Verification - Rogers Park Community</title>
</svelte:head>

<div class="resend-verification-page">
  <div class="resend-verification-card">
    <h1>Resend Verification Email</h1>
    
    {#if data.user.email_verified_at}
      <div class="info">
        <p>✓ Your email is already verified!</p>
        <a href="/dashboard" class="action-button">Go to Dashboard</a>
      </div>
    {:else}
      <p class="subtitle">
        Didn't receive the verification email? We can send you a new one.
      </p>

      {#if form?.error}
        <div class="error">
          {form.error}
        </div>
      {/if}

      {#if form?.success}
        <div class="success">
          <p>✓ {form.message}</p>
          <p class="help-text">
            Please check your email and click the verification link.
          </p>
        </div>
      {:else}
        <form method="POST">
          <div class="info-box">
            <p>
              We'll send a verification email to: <strong>{data.user.email}</strong>
            </p>
          </div>

          <button type="submit" class="submit-button">
            Send Verification Email
          </button>
        </form>
      {/if}

      <p class="back-link">
        <a href="/dashboard">Back to Dashboard</a>
      </p>
    {/if}
  </div>
</div>

<style>
  .resend-verification-page {
    max-width: 500px;
    margin: 2rem auto;
  }

  .resend-verification-card {
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

  .info {
    text-align: center;
    padding: 2rem 0;
  }

  .info p {
    color: #0a0;
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
  }

  .error {
    background: #fee;
    color: #c00;
    padding: 0.75rem;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
  }

  .success {
    background: #efe;
    color: #0a0;
    padding: 1rem;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
  }

  .success p:first-child {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .help-text {
    color: #666;
    font-size: 0.9rem;
  }

  .info-box {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 0.25rem;
    margin-bottom: 1.5rem;
  }

  .info-box p {
    margin: 0;
    color: #333;
  }

  .info-box strong {
    color: #0066cc;
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

  .submit-button:disabled {
    background: #999;
    cursor: not-allowed;
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

  .back-link {
    margin-top: 1.5rem;
    text-align: center;
    color: #666;
  }

  .back-link a {
    color: #0066cc;
    text-decoration: none;
  }
</style>
