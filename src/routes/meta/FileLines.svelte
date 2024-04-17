<script>
  import * as d3 from "d3";

  export let lines = [];

  let files = [];
  $: {
    files = d3.groups(lines, d => d.file).map(([name, lines]) => {
      return {name, lines};
    });
    files = d3.sort(files, d => -d.lines.length);
  }
</script>

<style>
  & > div {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: subgrid;
  }
  dt {
    grid-column: 1;
  }
  dd {
    grid-column: 2;
    display: flex;
    flex-wrap: wrap;
    align-items: start;
    align-content: start;
    gap: .15em;
    padding-top: .6em;
    margin-left: 0;
  }
  .line {
    display: flex;
    width: .5em;
    aspect-ratio: 1;
    background: steelblue;
    border-radius: 50%;
  }
</style>

<dl class="files">
  {#each files as file (file.name) }
    <div>
      <dt>
      <code>{file.name}</code>
      </dt>
      <dd>
        {#each file.lines as line (line.line) }
          <div class="line"></div>
        {/each}
      </dd>
    </div>
  {/each}
</dl>
