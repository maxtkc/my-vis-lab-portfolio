<script>
  import { page } from "$app/stores";

  let pages = [
    { url: "./", title: "Home" },
    { url: "./cv", title: "Resume" },
    { url: "./projects", title: "Projects" },
    { url: "./contact", title: "Contact" },
    { url: "./meta", title: "Meta" },
    { url: "https://github.com/maxtkc", title: "Github" },
    // add the rest of your pages here
  ];

  let localStorage = globalThis.localStorage ?? {};
  let colorScheme = localStorage.colorScheme ?? "light dark";
  let root = globalThis?.document?.documentElement;
  $: root?.style.setProperty("color-scheme", colorScheme);
  $: localStorage.colorScheme = colorScheme;
</script>

<label class="color-scheme">
  Theme:
  <select bind:value={colorScheme}>
    <option value="light dark">Automatic</option>
    <option value="light">Light</option>
    <option value="dark">Dark</option>
  </select>
</label>

<nav>
  {#each pages as p}
    <a
      href={p.url}
      class:current={"." + $page.route.id === p.url}
      target={p.url.startsWith("http") ? "_blank" : null}>{p.title}</a
    >
  {/each}
</nav>

<slot />

<style>
  .color-scheme {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font: inherit;
    font-size: 80%;
  }

  nav ul,
  nav li {
    display: contents;
  }

  nav {
    display: flex;
    margin-bottom: 1em;
    border-bottom: 1px solid var(--border-color);
  }

  .current {
    border-bottom: 0.4em solid var(--border-color);
  }

  nav a {
    flex: 1;
    text-decoration: none;
    color: inherit;
    text-align: center;
    padding: 0.5em;
  }

  nav a:hover {
    border-bottom: 0.4em solid var(--color-accent);
  }
</style>
