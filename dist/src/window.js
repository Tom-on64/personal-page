export function open_window(html, title = "window") {
	const win = document.createElement("div");
	win.className = "win";

	const bar = document.createElement("div");
	bar.className = "win-bar";

	const titleEl = document.createElement("span");
	titleEl.className = "win-title";
	titleEl.textContent = title;

	const btns = document.createElement("span");
	btns.className = "win-btns";

	const fsBtn = document.createElement("button");
	fsBtn.className = "win-btn";
	fsBtn.textContent = "[]";

	const closeBtn = document.createElement("button");
	closeBtn.className = "win-btn";
	closeBtn.textContent = "x";

	btns.appendChild(fsBtn);
	btns.appendChild(closeBtn);
	bar.appendChild(titleEl);
	bar.appendChild(btns);

	const frame = document.createElement("iframe");
	frame.className = "win-frame";
	frame.srcdoc = html;

	win.appendChild(bar);
	win.appendChild(frame);
	document.body.appendChild(win);

	let dragging = false, ox = 0, oy = 0;
	bar.addEventListener("mousedown", (e) => {
		dragging = true;
		ox = e.clientX - win.offsetLeft;
		oy = e.clientY - win.offsetTop;
		e.preventDefault();
	});
	document.addEventListener("mousemove", (e) => {
		if (!dragging) return;
		win.style.left = (e.clientX - ox) + "px";
		win.style.top = (e.clientY - oy) + "px";
	});
	document.addEventListener("mouseup", () => { dragging = false; });

	closeBtn.addEventListener("click", () => win.remove());

	let fullscreen = false;
	fsBtn.addEventListener("click", () => {
		if (!fullscreen) {
			win.dataset.prev = JSON.stringify({
				left: win.style.left, top: win.style.top,
				width: win.style.width, height: win.style.height,
			});
			win.classList.add("win-fullscreen");
			fullscreen = true;
		} else {
			const prev = JSON.parse(win.dataset.prev || "{}");
			win.style.left = prev.left || "";
			win.style.top = prev.top || "";
			win.style.width = prev.width || "";
			win.style.height = prev.height || "";
			win.classList.remove("win-fullscreen");
			fullscreen = false;
		}
	});

	return win;
}