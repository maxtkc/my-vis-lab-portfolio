<svelte:head>
    <title>Max Katz-Christy: Personal site and portfolio</title>
</svelte:head>

<script>
import projects from '$lib/projects.json';
import Project from "$lib/Project.svelte";
</script>

<h1>Max Katz-Christy</h1>
<p>Hi I like bikes. I like trains. I like learning new sports. Recently I got into bike polo, mountain bike racing, and ice hockey. These are all quite enjoyable.</p>
<img width="50%" src="images/cat.webp" alt="cat" />
<h2>Latest Projects</h2>
<div class="projects">
    {#each projects.slice(0, 3) as p}
        <Project info={p} hLevel=3 />
    {/each}
</div>
