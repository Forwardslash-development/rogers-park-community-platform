<script lang="ts">
  import type { LayoutData } from './$types';

  export let data: LayoutData;
</script>

<div class="app">
  <header>
    <nav>
      <a href="/">Home</a>
      {#if data.user}
        <a href="/dashboard">Dashboard</a>
        <form method="POST" action="/logout">
          <button type="submit" data-testid="logout">Logout</button>
        </form>
      {:else}
        <a href="/login">Login</a>
        <a href="/signup">Signup</a>
      {/if}
    </nav>
  </header>

  <main>
    <slot />
  </main>
</div>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  header {
    padding: 1rem;
    background: #f0f0f0;
  }

  nav {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  main {
    flex: 1;
    padding: 2rem;
  }

  button {
    background: #dc2626;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  a {
    text-decoration: none;
    color: #0066cc;
  }
</style>
