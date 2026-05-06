<script lang="ts">
  import type { ActionData } from './$types';

  export let form: ActionData;
</script>

<svelte:head>
  <title>Login - Rogers Park Community</title>
</svelte:head>

<div class="login-page">
  <div class="login-card">
    <h1>Welcome Back</h1>
    <p class="subtitle">Login to your account</p>

    {#if form?.error}
      <div class="error">
        {form.error}
      </div>
    {/if}

    <form method="POST">
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
        />
      </div>

      <button type="submit" class="submit-button">
        Login
      </button>
    </form>

    <p class="signup-link">
      Don't have an account? <a href="/signup">Sign up</a>
    </p>
  </div>
</div>

<style>
  .login-page {
    max-width: 400px;
    margin: 2rem auto;
  }

  .login-card {
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

  .signup-link {
    margin-top: 1.5rem;
    text-align: center;
    color: #666;
  }

  .signup-link a {
    color: #0066cc;
    text-decoration: none;
  }
</style>
