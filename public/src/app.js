const body = document.body;

// Page setup
const pageContent = body.innerHTML;
body.innerHTML = "";
const nav = document.createElement("nav");
nav.innerHTML = `<h1>Tom-on</h1><div id="buttons"><a href="/"><button>About me</button></a><a href="/project"><button>Projects</button></a><a href="/logs"><button>Logs</button></a><a href="/contact"><button>Contact</button></a><button id="themeSwitcher">Theme</button></div>`
body.appendChild(nav);

const main = document.createElement("main");
main.innerHTML = pageContent;
body.appendChild(main);

const footer = document.createElement("footer");
footer.innerHTML = `<div id="social">
  <a href="https://github.com/Tom-on64"><img src="/img/github.svg" alt="github"/></a>
  <a href="https://www.youtube.com/@tom-on5669/"><img src="/img/youtube.svg" alt="youtube"/></a>
  <a href="https://discord.com/invite/J4hZTEGjGY"><img src="/img/discord.svg" alt="discord"/></a>
  <a href="https://twitter.com/Tom_on1"><img src="/img/twitter.svg" alt="twitter"/></a>
  <a href="https://www.instagram.com/tomon_64/?igshid=YmMyMTA2M2Y="><img src="/img/instagram.svg" alt="instagram"/></a>
</div>`
body.appendChild(footer);

// Theme setup
let theme = localStorage.getItem("theme");
if (!theme) theme = "dark";

if (theme == "light") {
  document.body.classList.remove("dark");
  document.body.classList.add("light");
}

const switchTheme = () => {
  if (theme == "dark") {
    body.classList.remove("dark");
    body.classList.add("light");
    theme = "light";
  } else {
    body.classList.remove("light");
    body.classList.add("dark");
    theme = "dark";
  }
  localStorage.setItem("theme", theme);
};

document.getElementById("themeSwitcher").onclick = switchTheme;
