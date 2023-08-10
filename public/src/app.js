let isDark = false;

const switchTheme = () => {
  const body = document.body;
  if (isDark) {
    body.classList.remove("dark");
    body.classList.add("light");
    isDark = false;
  } else {
    body.classList.remove("light");
    body.classList.add("dark");
    isDark = true;
  }
};

document.getElementById("themeSwitcher").onclick = switchTheme;
