<svelte:head>
  <title>Contact me</title>
</svelte:head>
<h1>Contact</h1>
<form action="mailto:junk@gmail.com" method="POST" enctype="text/plain">
  <label for="email">Email: <input name="email" id="name" type="email" /></label
  >
  <label for="subject">Subject: <input name="subject" type="text" /></label>
  <label for="body">Body: <textarea name="body"></textarea></label>
  <button>Send Email</button>
</form>
