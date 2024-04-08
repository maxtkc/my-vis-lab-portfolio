<script>
	// https://github.com/topojson/us-atlas
	// https://github.com/d3/d3-geo
	// https://observablehq.com/@mbostock/u-s-state-map
	// TODO: https://observablehq.com/@d3/u-s-map
	// TODO: https://observablehq.com/@jeantimex/us-state-county-map
	
	import { onMount } from 'svelte';
	import * as topojson from 'topojson-client';
	import { geoPath, geoAlbersUsa } from 'd3-geo';
	import { draw } from 'svelte/transition';
  import * as d3 from "d3";
  import RangeSlider from "svelte-range-slider-pips";
  let values = [0, .2];
	
	// https://github.com/topojson/us-atlas#us-atlas-topojson
	// const projection = geoAlbersUsa().scale(11300).translate([-3087.5, 1405])
	// const projection = d3.geoConicConformal()
  //   .parallels([42, 43])
  //   .rotate([98, 0])
  //   .scale(975)
  //   .center([0, 38])
  //   .translate([975 / 2, 610 / 2])
  //   .clipExtent([[0, 0], [975, 610]])
  //   .precision(0.2);
  //     // .parallels([29.5, 45.5])
  //     // .rotate([98, 0])
  //     // .center([0, 38])
  //     // .scale(1000);
  const projection = d3.geoConicEqualArea()
      .parallels([42, 43])
      .scale(200000)
      .translate([480, 250])
      .rotate([72, 0])
      .center([.9, 42.33]);
	
	const path = geoPath().projection(projection);

  const colorScale = d3.scaleThreshold()
  .domain(d3.ticks(0, .5, 10))
  .range(d3.schemeBlues[7]);
	
	let states = [];
	let counties = []
	let mesh;
	let selected;
	//$: console.log({ selected })
	
	const points = [
		{ lat: 38.421115245736, long: -82.44432596047203 },
	].map(p => projection([p.long, p.lat]))

  let us;
	
	onMount(async () => {
		us = await fetch('evictions_with_geo.topojson')
		// const us = await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json')
			.then(d => d.json())
		console.log({ us })

    us.objects["-"].geometries.forEach(geom => {
      const eviction_rate = (geom.properties["2020_eviction"] + geom.properties["2021_eviction"] + geom.properties["2022_eviction"] + geom.properties["2023_eviction"])/ (geom.properties.pop * (1 - geom.properties.corp_own_rate));
      geom.properties.eviction_rate = eviction_rate == Infinity || isNaN(eviction_rate) ? 0 : eviction_rate;
      const corp_buy_rate = (geom.properties.buyer_bnk_ind_sum + geom.properties.buyer_bus_ind_sum + geom.properties.buyer_gse_ind_sum + geom.properties.buyer_llc_ind_sum + geom.properties.buyer_trst_ind_sum) / geom.properties.num_sales_transactions
      geom.properties.corp_buy_rate = corp_buy_rate == Infinity || isNaN(corp_buy_rate) ? 0 : corp_buy_rate;
    })

    // console.log(us.objects["-"].geometries)
            console.log(us.objects["-"].geometries.map(geom => geom.properties.corp_buy_rate))
		
	})

  $: {
    if (us !== undefined) {
      // us.objects["-"].geometries = us.objects["-"].geometries.filter(geom => geom.properties.eviction_rate > values[0] && geom.properties.eviction_rate < values[1]);
      states = topojson.feature(us, us.objects["-"]).features;
    }
		// states = topojson.feature(us, us.objects["counties"]).features;
		// console.log({ features })
		
		// counties = topojson.feature(us, us.objects.counties).features;

		// mesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b);
		
		// $: console.log({ states, counties, mesh })
  }
  $: console.log({ states })
</script>

<svelte:head>
  <title>FP2</title>
</svelte:head>

<h1>FP2</h1>

<svg style="border: 2px solid red" viewBox="0 0 975 610">
	<!-- State shapes -->
	<g fill="white" stroke="black">
		{#each states as feature, i}
      <!--<path d={path(feature)} on:click={() => selected = feature} class="state" in:draw={{ delay: i * 50, duration: 1000 }} />-->
      {#if feature.properties.eviction_rate > values[0] & feature.properties.eviction_rate < values[1]}
        <path fill={colorScale(feature.properties.corp_buy_rate)} d={path(feature)} on:click={() => selected = feature} class="state" />
      {/if}
		{/each}
				

	</g>
		
	<!-- Interior lines -->
<!-- 	<path d={path(mesh)} fill="none" stroke="black" /> -->
		
	{#if selected}
		<path d={path(selected)} fill="hsl(0 0% 50% / 20%)" stroke="black" stroke-width={2} />
	{/if}
		
	<!--{#each counties as feature, i}
	  <path d={path(feature)} on:click={() => selected = feature} class="county" stroke="rgb(0 0 0 / 10%)" fill="none" />
  {/each}-->
	
	{#each points as [cx, cy]}
		<circle {cx} {cy} r={10} fill="black" />
		<circle {cx} {cy} r={8} fill="white" />
		<circle {cx} {cy} r={5} fill="black" />
	{/each}
</svg>

<RangeSlider min={0} max={.2} step={.2/100} pipstep={.2} range pushy pips float first=label last=label bind:values={values} />

<h1>{values[0]}</h1>

<div class="selectedName">{selected?.properties.name ?? ''}</div>
	
<style>
	.county:hover {
		fill: hsl(0 0% 50% / 20%);
	}
	
	.selectedName {
		text-align: center;
		margin-top: 8px;
		font-size: 1.5rem;
	}
</style>
