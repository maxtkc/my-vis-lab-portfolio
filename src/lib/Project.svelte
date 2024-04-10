<script>
  export let info = {};
  export let hLevel = 2;
  let p;
  $: p = info;
</script>

<article>
    <a href={p.url}>
        <svelte:element this={"h" + hLevel}>{p.title}</svelte:element>
        <img src={p.image} alt="" />
        <div>
            <p>{p.description}</p>
            <p>C. {p.year}</p>
        </div>
    </a>
</article>

<style>
  article {
    display: grid;
    grid-template-rows: subgrid;
    grid-row: span 3;
  }

  article h2,
  h3 {
    margin: 0;
  }

  p:nth-child(2) {
    font-family: Baskerville;
    font-variant-numeric: oldstyle-nums;
  }

  a {
    color: inherit; /* blue colors for links too */
    text-decoration: inherit; /* no underline */
  }
</style>
