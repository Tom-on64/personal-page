import { vfs_read, vfs_write } from "./vfs.js";
import ENV from "./env.js";

let history = [];
let history_index = -1;
let cur_input = "";

export function history_get() {
	return history;
}

export function history_read(path = `${ENV.HOME}/.history`) {
	let hist_file;

	try {
		hist_file = vfs_read(path);
	} catch (e) {}

	if (!hist_file || hist_file.type !== "string") {
		hist_file = { data: "", type: typeof("") };
	}

	history = hist_file.data.split('\n');
}


export function history_write(path = `${ENV.HOME}/.history`) {
	vfs_write(path, history.join('\n'), true);
} 

export function history_push(cmd) {
	cmd = cmd.trim();
	if (!cmd) return;

	if (history.length <= 0 || history[history.length - 1] === cmd) {
		history_index = -1;
		return;
	}

	history.push(cmd);
	history_index = -1;
}

export function history_prev(cur) {
	if (history.length === 0) return cur;

	if (history_index === -1) {
		cur_input = cur;
		history_index = history.length - 1;
	} else if (history_index > 0) {
		history_index--;
	}

	return history[history_index];
}

export function history_next(cur) {
	if (history_index === -1) return cur;

	if (history_index < history.length - 1) {
		return history[++history_index];
	} else {
		history_index = -1;
		return cur_input;
	}
}

