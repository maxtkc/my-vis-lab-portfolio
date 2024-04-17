<script>
  import * as d3 from "d3";

  export let commits = [];
  export let selectedCommits = [];

  let svg;
  $: {
    d3.select(svg).call(d3.brush().on("start brush end", brushed));
    d3.select(svg).selectAll(".dots, .overlay ~ *").raise();
  }

  let xAxis, yAxis;

  $: {
    d3.select(xAxis).call(d3.axisBottom(xScale));
    d3.select(yAxis).call(d3.axisLeft(yScale));
    d3.select(yAxis).call(d3.axisLeft(yScale).tickFormat(d => String(d %
      24).padStart(2, "0") + ":00"));
  }

  let yAxisGridlines;

  $: {
    d3.select(yAxisGridlines).call(
      d3.axisLeft(yScale)
      .tickFormat("")
      .tickSize(-usableArea.width)
    );
  }

  let width = 1000, height = 600;
  let margin = {top: 10, right: 10, bottom: 30, left: 20};

  let usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left
  };
  usableArea.width = usableArea.right - usableArea.left;
  usableArea.height = usableArea.bottom - usableArea.top;

  let xScale, yScale;
  $: xScale = d3.scaleTime(d3.extent(commits, commit => commit.date), [usableArea.left, usableArea.right]).nice();
  $: yScale = d3.scaleLinear([0, 24], [usableArea.bottom, usableArea.top])

  function isCommitSelected (commit) {
    return selectedCommits.includes(commit);
  }

  let hoveredIndex = -1;
  $: hoveredCommit = commits[hoveredIndex] ?? {};

  let cursor = {x: 0, y: 0};

  function brushed (evt) {
    let brushSelection = evt.selection;
    selectedCommits = !brushSelection ? [] : commits.filter(commit => {
      let min = {x: brushSelection[0][0], y: brushSelection[0][1]};
      let max = {x: brushSelection[1][0], y: brushSelection[1][1]};
      let x = xScale(commit.date);
      let y = yScale(commit.hourFrac);

      return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
    });
  }

  function dotInteraction (index, evt) {
    if (evt.type === "mouseenter" || evt.type === "focus") {
      hoveredIndex = index;
      cursor = {x: evt.x, y: evt.y};
    }
    else if (evt.type === "mouseleave" || evt.type === "blur") {
      hoveredIndex = -1
    }
    else if (evt.type === "click" || (evt.type === "keyup" && evt.key === "Enter")) {
      selectedCommits = [commits[index]];
    }
  }
</script>

<style>
  svg {
    overflow: visible;
  }
  .gridlines {
    stroke-opacity: .2;
  }
  circle {
    transition: 200ms;
    transform-origin: center;
    transform-box: fill-box;
    &:hover {
      transform: scale(1.5);
    }
    @starting-style {
      r: 0;
    }
  }
  dl.info {
    padding: 10px;
    display:grid;
    grid-template-columns: 50px auto;
    background-color: oklch(100% 0% 0 / 80%);
    box-shadow: 5px 5px 15px var(--border-color);
    border-radius: 5px;
    backdrop-filter: blur(2px);
    transition-duration: 500ms;
    transition-property: opacity, visibility;

  &[hidden]:not(:hover, :focus-within) {
    opacity: 0;
    visibility: hidden;
  }
  }
  .tooltip {
    position: fixed;
    top: 1em;
    left: 1em;
  }
</style>

<dl id="commit-tooltip" class="info tooltip" hidden={hoveredIndex === -1} style="top: {cursor.y}px; left: {cursor.x}px">
	<dt>Commit</dt>
	<dd><a href="{ hoveredCommit.url }" target="_blank">{ hoveredCommit.id }</a></dd>

	<dt>Date</dt>
	<dd>{ hoveredCommit.datetime?.toDateString("en", {date: "full"}) }</dd>

	<dt>Time</dt>
	<dd>{ hoveredCommit.datetime?.toLocaleTimeString("en", {timeZoneName: "short"}) }</dd>

	<dt>Author</dt>
	<dd>{ hoveredCommit.author }</dd>

	<dt>Lines</dt>
	<dd>{ hoveredCommit.totalLines }</dd>
</dl>

<svg viewBox="0 0 {width} {height}" bind:this={svg}>
    <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
    <g transform="translate({usableArea.left}, 0)" bind:this={yAxis} />
    <g class="gridlines" transform="translate({usableArea.left}, 0)" bind:this={yAxisGridlines} />
    <g class="dots">
        {#each commits as commit, index (commit.id) }
            <circle
                cx={ xScale(commit.datetime) }
                cy={ yScale(commit.hourFrac) }
                r="13"
                fill={selectedCommits && isCommitSelected(commit) ? "red" : "steelblue" }
                on:mouseenter={evt => dotInteraction(index, evt)}
                on:mouseleave={evt => dotInteraction(index, evt)}
                on:click={evt => dotInteraction(index, evt)}
                on:keyup={evt => dotInteraction(index, evt)}
            />
        {/each}
    </g>
</svg>
