console.log("IT’S ALIVE!");

function $$ (selector, context = document) {
	return Array.from(context.querySelectorAll(selector));
}

const navLinks = $$("nav a");
const currentLink = navLinks.find(a => a.host === location.host && a.pathname === location.pathname)
currentLink?.classList.add("current");

document.body.insertAdjacentHTML("afterbegin", `
	<label class="color-scheme">
		Theme:
		<select>
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
		</select>
	</label>`
);

const select = document.querySelector(".color-scheme select");

select.value = "colorScheme" in localStorage ? localStorage.colorScheme : "light dark";
document.documentElement.style.setProperty("color-scheme", select.value);

select.addEventListener("input", function (event) {
	console.log("color scheme changed to", event.target.value);
  document.documentElement.style.setProperty("color-scheme", event.target.value);
  localStorage.colorScheme = event.target.value
});
