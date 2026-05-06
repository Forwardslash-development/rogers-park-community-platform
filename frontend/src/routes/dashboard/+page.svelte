<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<svelte:head>
  <title>Dashboard - Rogers Park Community</title>
</svelte:head>

<div class="dashboard">
  <h1>Dashboard</h1>
  
  <div class="user-info">
    <h2>Welcome, {data.user.display_name}!</h2>
    <dl>
      <dt>Email:</dt>
      <dd>{data.user.email}</dd>
      
      <dt>Role:</dt>
      <dd>{data.user.role}</dd>
      
      <dt>Member Since:</dt>
      <dd>{new Date(data.user.created_at).toLocaleDateString()}</dd>
    </dl>
  </div>

  <p>This is a protected route. Only authenticated users can see this.</p>
</div>

<style>
  .dashboard {
    max-width: 800px;
    margin: 0 auto;
  }

  h1 {
    margin-bottom: 2rem;
  }

  .user-info {
    background: white;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }

  h2 {
    margin: 0 0 1rem 0;
  }

  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem 1rem;
  }

  dt {
    font-weight: 600;
    color: #666;
  }

  dd {
    margin: 0;
  }
</style>
