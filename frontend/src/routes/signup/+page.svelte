<script lang="ts">
  import type { ActionData } from './$types';

  export let form: ActionData;
</script>

<svelte:head>
  <title>Sign Up - Rogers Park Community</title>
</svelte:head>

<div class="signup-page">
  <div class="signup-card">
    <h1>Create Your Account</h1>
    <p class="subtitle">Join the Rogers Park community</p>

    {#if form?.error}
      <div class="error">
        {form.error}
      </div>
    {/if}

    <form method="POST">
      <div class="form-group">
        <label for="display_name">Display Name</label>
        <input
          type="text"
          id="display_name"
          name="display_name"
          value={form?.display_name || ''}
          required
          minlength="2"
          maxlength="100"
        />
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={form?.email || ''}
          required
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          minlength="8"
        />
        <small>At least 8 characters</small>
      </div>

      <button type="submit" class="submit-button">
        Create Account
      </button>
    </form>

    <p class="login-link">
      Already have an account? <a href="/login">Login</a>
    </p>
  </div>
</div>

<style>
  .signup-page {
    max-width: 400px;
    margin: 2rem auto;
  }

  .signup-card {
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
</style>
