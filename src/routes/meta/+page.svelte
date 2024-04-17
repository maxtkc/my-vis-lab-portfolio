<script>
  import * as d3 from "d3";
  import Pie from "$lib/Pie.svelte";
  import CommitScatterplot from "./Scatterplot.svelte";
  import FileLines from "./FileLines.svelte";

  import { onMount } from "svelte";

  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  let data = [];
  let commits = [];

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
        url: "https://github.com/vis-society/lab-7/commit/" + commit,
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
  let timeScale;
  $: timeScale = d3.scaleTime([d3.min(commits, c => c.datetime), d3.max(commits, c => c.datetime)], [0, 100]);
  $: commitMaxTime = timeScale.invert(commitProgress);

  let filteredCommits, filteredLines;
  $: filteredCommits = commits.filter(commit => commit.datetime <= commitMaxTime);
  $: filteredLines = data.filter(d => d.datetime <= commitMaxTime);

  let selectedCommits = [];

  $: hasSelection = selectedCommits.length > 0;

  let selectedLines, languageBreakdown;

  $: selectedLines = (hasSelection ? selectedCommits : filteredCommits).flatMap(d => d.lines);
  $: languageBreakdown = d3.rollup(selectedLines, lines => lines.length, line => line.type);
</script>

<style>
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

<div class="timefilter">
  <label>Filter by time:
    <input type=range min=0 max=100 bind:value={commitProgress} />
  </label>
  <time>{commitMaxTime.toLocaleString(undefined, {dateStyle: "long", timeStyle: "short"})}</time>
</div>

<FileLines lines={filteredLines} colors={colors} />

<CommitScatterplot commits={filteredCommits} bind:selectedCommits={selectedCommits} />

<p>{hasSelection ? selectedCommits.length : "No"} commits selected</p>

<dl class="stats">
  {#each languageBreakdown as [language, lines] }
    <dt>{ language }</dt>
    <dd>{ lines } ({ d3.format(".1~%")(lines / selectedLines.length) })</dd>
  {/each}
</dl>

<Pie colors={colors} data={Array.from(languageBreakdown).map(([language, lines]) => ({label: language, value: lines}))}/>
