<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<svelte:head>
  <title>Rogers Park Community Platform</title>
</svelte:head>

<div class="home">
  <h1>Welcome to Rogers Park Community Platform</h1>

  {#if data.user}
    <p>Hello, {data.user.display_name}!</p>
    <a href="/dashboard">Go to Dashboard →</a>
  {:else}
    <p>Community-owned events and venue knowledge graph for Rogers Park, Chicago.</p>
    <div class="cta">
      <a href="/signup" class="button">Get Started</a>
      <a href="/login">Already have an account? Login</a>
    </div>
  {/if}
</div>

<style>
  .home {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .cta {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .button {
    background: #0066cc;
    color: white;
    padding: 0.75rem 2rem;
    border-radius: 0.5rem;
    text-decoration: none;
    font-weight: 600;
  }
</style>
