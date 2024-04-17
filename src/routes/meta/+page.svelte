<script>
  import * as d3 from "d3";
  import Pie from "$lib/Pie.svelte";
  import CommitScatterplot from "./Scatterplot.svelte";
  import FileLines from "./FileLines.svelte";
  import Scrolly from "svelte-scrolly";

  import { onMount } from "svelte";

  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  let data = [];
  let commits = [];

  const commit_labels = [
    "Initial commit",
    "migrate old site",
    "make project separate",
    "whoops add layout",
    "finish lab 4",
    "start lab 6",
    "add pie",
    "lab 6 finished",
    "add meta and eloquent",
    "prettier",
    "step 0",
    "add commits stats",
    "lab 7",
    "change color of selected",
    "fp2 mockup",
    "fix vite issue",
    "change to corporate buy rate",
    "make nice",
    "add stamen copyright",
    "add ref to bike watching",
    "0.1",
    "1.2",
    "1.4",
    "move scatterplot",
    "add file lines",
    "2.3",
    "2.4",
    "colors top level",
    "animate files",
    "3.3",
    "3.4",
    "finish 3",
    "finish lab 9",
    "fix pie transition"
  ]

  onMount(async () => {
    data = await d3.csv("loc.csv", row => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + "T00:00" + row.timezone),
      datetime: new Date(row.datetime)
    }));
    commits = d3.groups(data, d => d.commit).map(([commit, lines]) => {
      let first = lines[0];
      let {author, date, time, timezone, datetime} = first;
      let ret = {
        id: commit,
        url: "https://github.com/maxtkc/my-vis-lab-portfolio/commit/" + commit,
        author, date, time, timezone, datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length
      };

      // Like ret.lines = lines
      // but non-enumerable so it doesn’t show up in JSON.stringify
      Object.defineProperty(ret, "lines", {
        value: lines,
        configurable: true,
        writable: true,
        enumerable: false,
      });

      return ret;
    });
  });

  let commitProgress = 100;
  let raceProgress = 100;
  let timeScale;
  $: timeScale = d3.scaleTime([d3.min(commits, c => c.datetime), d3.max(commits, c => c.datetime)], [0, 100]);
  $: commitMaxTime = timeScale.invert(commitProgress);
  $: raceMaxTime = timeScale.invert(raceProgress);

  let filteredCommits, filteredLines;
  $: filteredCommits = commits.filter(commit => commit.datetime <= commitMaxTime);
  $: filteredLines = data.filter(d => d.datetime <= commitMaxTime);
  $: raceFilteredLines = data.filter(d => d.datetime <= raceMaxTime);

  let selectedCommits = [];

  $: hasSelection = selectedCommits.length > 0;

  let selectedLines, languageBreakdown;

  $: selectedLines = (hasSelection ? selectedCommits : filteredCommits).flatMap(d => d.lines);
  $: languageBreakdown = d3.rollup(selectedLines, lines => lines.length, line => line.type);
  $: sortedCommits = d3.sort(commits, c => c.datetime);
</script>

<style>
  :global(body) {
    max-width: min(120ch, 80vw);
  }
  .timefilter {
    display: grid;
    grid-template-columns: 1fr;
  }
  .timefilter label {
    display: flex;
    gap: 1em;
  }
  .timefilter label input {
    flex: 1;
  }
  .timefilter time {
    flex: 1;
    text-align: right;
  }
</style>

<svelte:head>
  <title>Meta</title>
</svelte:head>

<h1>Meta</h1>


<dl class="stats">
	<dt>Total <abbr title="Lines of code">LOC</abbr></dt>
	<dd>{filteredLines.length}</dd>

	<dt>Total number of commits</dt>
	<dd>{filteredCommits.length}</dd>

	<dt>Number of files in the codebase</dt>
  <dd>{d3.group(filteredLines, d => d.file).size}</dd>

	<dt>Maximum file length (in lines)</dt>
  <dd>{d3.max(filteredLines, d => d.line)}</dd>

	<dt>Longest file</dt>
  <dd>{d3.greatest(filteredLines, d => d.line)?.file}</dd>
</dl>

<h2>Commits by time of day</h2>

<!--
<div class="timefilter">
  <label>Filter by time:
    <input type=range min=0 max=100 bind:value={commitProgress} />
  </label>
  <time>{commitMaxTime.toLocaleString(undefined, {dateStyle: "long", timeStyle: "short"})}</time>
</div>
-->

<Scrolly throttle=50 debounce=50 bind:progress={ commitProgress }>
  {#each sortedCommits as commit, index }
    <p>
      On {commit.datetime.toLocaleString("en", {dateStyle: "full", timeStyle: "short"})},
      I made the change <a href="{commit.url}" target="_blank">{ commit_labels[index] }</a>.
      I edited {commit.totalLines} lines across { d3.rollups(commit.lines, D => D.length, d => d.file).length } files.
    </p>
  {/each}

  <svelte:fragment slot="viz">
    <CommitScatterplot commits={filteredCommits} bind:selectedCommits={selectedCommits} />

    <p>{hasSelection ? selectedCommits.length : "No"} commits selected</p>

    <!--
      <dl class="stats">
      {#each languageBreakdown as [language, lines] }
        <dt>{ language }</dt>
        <dd>{ lines } ({ d3.format(".1~%")(lines / selectedLines.length) })</dd>
      {/each}
      </dl>
    -->
    <Pie transitionDuration={300} colors={colors} data={Array.from(languageBreakdown).map(([language, lines]) => ({label: language, value: lines}))}/>
  </svelte:fragment>
</Scrolly>

<Scrolly bind:progress={raceProgress} --scrolly-layout="viz-first" --scrolly-viz-width="1.5fr" throttle=10 debounce=10>
  {#each sortedCommits as commit, index }
    <p>
      On {commit.datetime.toLocaleString("en", {dateStyle: "full", timeStyle: "short"})},
      I made the change <a href="{commit.url}" target="_blank">{ commit_labels[index] }</a>.
      I edited {commit.totalLines} lines across { d3.rollups(commit.lines, D => D.length, d => d.file).length } files.
    </p>
  {/each}

  <svelte:fragment slot="viz">
    <FileLines lines={raceFilteredLines} colors={colors} />
  </svelte:fragment>
</Scrolly>
