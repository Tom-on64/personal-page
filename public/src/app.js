let theme = localStorage.getItem("theme");
if (!theme) theme = "light";

if (theme == "dark") {
  document.body.classList.remove("light");
  document.body.classList.add("dark");
}

const switchTheme = () => {
  const body = document.body;
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

document.getElementById("aboutBtn").onclick = () =>
  (window.location.href = "/");
document.getElementById("projectBtn").onclick = () =>
  (window.location.href = "/project");
document.getElementById("logsBtn").onclick = () =>
  (window.location.href = "/logs");
document.getElementById("contactBtn").onclick = () =>
  (window.location.href = "/contact");

document.getElementById("themeSwitcher").onclick = switchTheme;
start();
