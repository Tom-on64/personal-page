import ENV from "./env.js";
import { history_next, history_prev } from "./history.js";
import { shell_run } from "./shell.js";
import { ctx, vfs_normalize_path, vfs_readdir, vfs_resolve, IS_DIR } from "./vfs.js";

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

let comp = { prefix: null, candidates: [], index: -1, base: null };

function complete() {
	const input = con.in.value;
	const parts = input.split(/\s+/);
	const last = parts[parts.length - 1] || "";

	// if continuing a previous completion cycle
	if (comp.prefix !== null && input === comp.base) {
		if (comp.index === -1) comp.index = 0;
		else comp.index = (comp.index + 1) % comp.candidates.length;
		const cand = comp.candidates[comp.index];
		parts[parts.length - 1] = comp.prefix_dir + cand;
		con.in.value = parts.join(" ");
		comp.base = con.in.value;
		return;
	}

	let candidates = [];

	if (parts.length <= 1 && !last.includes("/")) {
		try {
			const paths = ENV.PATH.split(":");
			const seen = new Set();
			for (const p of paths) {
				try {
					for (const n of vfs_readdir(p)) {
						if (n.startsWith(last) && !seen.has(n)) { seen.add(n); candidates.push(n); }
					}
				} catch (e) {}
			}
		} catch (e) {}
	} else {
		let dir = ctx.cwd;
		let prefix = last;
		if (last.includes("/")) {
			const idx = last.lastIndexOf("/");
			const d = last.slice(0, idx) || "/";
			try { dir = vfs_normalize_path(d === "/" ? "/" : d); } catch (e) { dir = ctx.cwd; }
			prefix = last.slice(idx + 1);
		}
		try {
			const entries = vfs_readdir(dir);
			candidates = entries.filter(n => n.startsWith(prefix)).map(n => {
				try {
					const node = vfs_resolve(`${dir}/${n}`.replace("//", "/")).node;
					return IS_DIR(node) ? n + "/" : n;
				} catch (e) { return n; }
			});
		} catch (e) {}
	}

	let prefix_dir = "";
	if (last.includes("/")) prefix_dir = last.slice(0, last.lastIndexOf("/") + 1);

	if (candidates.length === 1) {
		parts[parts.length - 1] = prefix_dir + candidates[0];
		con.in.value = parts.join(" ");
		comp = { prefix: last, candidates, index: 0, base: con.in.value, prefix_dir };
	} else if (candidates.length > 1) {
		comp = { prefix: last, candidates, index: -1, base: input, prefix_dir };
		const line = document.createElement("p");
		line.innerText = candidates.join("  ");
		con.out.appendChild(line);
	} else {
		comp = { prefix: null, candidates: [], index: -1, base: null, prefix_dir: "" };
	}
}

const keys = {
	"tab": () => { complete(); },
	"enter": () => {
		shell_run(gets());
		con.in.value = "";
	},
	"arrowup": () => {
		con.in.value = history_prev(gets());
	},
	"arrowdown": () => {
		con.in.value = history_next(gets());
	},
};

const keys_ctrl = {
	"l": () => { cls(); },
	"m": keys.enter,
};

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

