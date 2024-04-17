<script>
  import * as d3 from "d3";

  export let colors = d3.scaleOrdinal(d3.schemeTableau10);
  export let data = [];
  export let selectedIndex = -1;
  export let transitionDuration = 3000;

  let pieData, oldData;
  $: {
    let arcs, arcData;
    // pieData = data.map(d => ({...d}));
    oldData = pieData
    pieData = d3.sort(data, d => d.label);
    arcData = sliceGenerator(pieData);
    arcs = arcData.map((d) => arcGenerator(d));
    pieData = pieData.map((d, i) => ({...d, ...arcData[i], arc: arcs[i]}));
    transitionArcs();
  };

  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let sliceGenerator = d3.pie().value(d => d.value).sort(null);

  let wedges = {};

  function transitionArcs() {
    let wedgeElements = Object.values(wedges);

    d3.selectAll(wedgeElements).transition("arc")
      .duration(transitionDuration)
      .styleTween("d", function (_, index) {
        let wedge = this;
        // Calculations that will only be done once per element go here
        let label = Object.keys(wedges)[index];
        let d = pieData.find(d => d.label === label);
        let d_old = oldData.find(d => d.label === label);
        if (!d || !d_old) {
          return;
        }
        // Always clone objects first, see note in https://d3js.org/d3-interpolate/value#interpolateObject
        let from = {...d_old};
        let to = {...d};
        let angleInterpolator = d3.interpolate(from, to);
        let interpolator = t => `path("${ arcGenerator(angleInterpolator(t)) }")`;
        return t => {
          // t is a number between 0 and 1 that represents the transition progress
          // TODO Interpolate the angles and return the path string that corresponds to t
          return interpolator(t);
        };
      });
  }
</script>

<div class="container">
  <svg viewBox="-50 -50 100 100">
    {#each pieData as d, index (d.label)}
      <path
        d={d.arc}
        fill={colors(d.id ?? d.label)}
        tabindex="0"
        role="button"
        aria-label="foo"
        class:selected={selectedIndex === index}
        on:click={(e) => (selectedIndex = selectedIndex === index ? -1 : index)}
        bind:this={ wedges[d.label] }
      />
    {/each}
  </svg>
  <ul class="legend">
    {#each pieData as d, index}
      <li style="--color: {colors(d.id ?? d.label)}">
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
    transition: transitionDuration;
    transition-property: transform, opacity, fill;
    cursor: pointer;
  }
  .selected {
    --color: oklch(60% 45% 0) !important;

    &:is(path) {
      fill: var(--color);
    }
  }
</style>
