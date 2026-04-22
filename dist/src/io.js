import { shell_run } from "./shell.js";

const con = { in: null, out: null, main: null };

export function puts(s) {
	const line = document.createElement("p");
	line.innerText = s;
	con.out.appendChild(line);
}

export function gets() {
	return con.in.value;
}

export function cls() {
	for (const child of [...main.children]) {
		if (child.id !== "console") child.remove();
	}
	con.out.innerHTML = "";
}

const keys = {
	"enter": () => {
		shell_run(gets());
		con.in.value = "";
	},
};
const keys_ctrl = {
	"l": () => shell_run("/bin/clear"),
}

export function io_init(conin_id, conout_id, main_id) {
	con.main = document.getElementById(main_id);
	con.in = document.getElementById(conin_id),
	con.out = document.getElementById(conout_id),

	document.addEventListener("click", () => { con.in.focus(); })

	con.in.addEventListener("keydown", (e) => {
		let k = keys;
		if (e.ctrlKey) k = keys_ctrl;
		if (!k[e.key.toLowerCase()]) return;
		e.preventDefault();
		k[e.key.toLowerCase()]();
		window.scrollTo(0, document.body.scrollHeight);
	})
}

