<script>
  import * as d3 from "d3";

  export let data = [];
  export let selectedIndex = -1;

  let pieData;
  $: {
    let arcs, arcData;
    pieData = data.map(d => ({...d}));
    arcData = sliceGenerator(pieData);
    arcs = arcData.map((d) => arcGenerator(d));
    pieData = pieData.map((d, i) => ({...d, ...arcData[i], arc: arcs[i]}));
  };

  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let sliceGenerator = d3.pie().value((d) => d.value);
  let colors = d3.scaleOrdinal(d3.schemeTableau10);
</script>

<div class="container">
  <svg viewBox="-50 -50 100 100">
    {#each pieData as d, index}
      <path
        d={d.arc}
        fill={colors(d.label)}
        tabindex="0"
        role="button"
        aria-label="foo"
        class:selected={selectedIndex === index}
        on:click={(e) => (selectedIndex = selectedIndex === index ? -1 : index)}
      />
    {/each}
  </svg>
  <ul class="legend">
    {#each pieData as d, index}
      <li style="--color: {colors(d.label)}">
        <span class="swatch"></span>
        {d.label} <em>({d.value})</em>
      </li>
    {/each}
  </ul>
</div>

<style>
  svg {
    max-width: 20em;
    margin-block: 2em;

    /* Do not clip shapes outside the viewBox */
    overflow: visible;
  }
  .swatch {
    width: 12.5px;
    aspect-ratio: 1 / 1;
    background-color: var(--color);
    border-radius: 25%;
    display: inline-block;
  }
  .legend {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(9em, 1fr));
    padding: 10px;
    margin: 10px;
    border: 1px solid grey;
    flex: 1;
  }
  li {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .container {
    display: flex;
    align-items: center;
    gap: 30px;
  }

  svg:has(path:hover) path:not(:hover) {
      opacity: 50%;
  }

  path {
    transition: 300ms;
    cursor: pointer;
  }
  .selected {
    --color: oklch(60% 45% 0) !important;

    &:is(path) {
      fill: var(--color);
    }
  }
</style>
