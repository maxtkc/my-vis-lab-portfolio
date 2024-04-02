<script>
  import projects from "$lib/projects.json";
  import Project from "$lib/Project.svelte";
</script>

<svelte:head>
  <title>Max Katz-Christy: Personal site and portfolio</title>
</svelte:head>

<h1>Max Katz-Christy</h1>
<p>
  Hi I like bikes. I like trains. I like learning new sports. Recently I got
  into bike polo, mountain bike racing, and ice hockey. These are all quite
  enjoyable.
</p>

{#await fetch("https://api.github.com/users/maxtkc")}
  <p>Loading...</p>
{:then response}
  {#await response.json()}
    <p>Decoding...</p>
  {:then data}
    <section>
      <h2>My GitHub Stats</h2>
      <dl>
        <dt>Followers</dt>
        <dd>{data.followers}</dd>

        <dt>Following</dt>
        <dd>{data.following}</dd>

        <dt>Public Repos</dt>
        <dd>{data.public_repos}</dd>

        <dt>Public Gists</dt>
        <dd>{data.public_gists}</dd>
      </dl>
    </section>
  {:catch error}
    <p class="error">
      Something went wrong: {error.message}
    </p>
  {/await}
{:catch error}
  <p class="error">
    Something went wrong: {error.message}
  </p>
{/await}

<img width="50%" src="images/cat.webp" alt="cat" />
<h2>Latest Projects</h2>
<div class="projects">
  {#each projects.slice(0, 3) as p}
    <Project info={p} hLevel="3" />
  {/each}
</div>
