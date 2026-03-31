import { P, vfs_check_perm, vfs_resolve } from "./vfs.js";
import { puts } from "./io.js";
import ENV from "./env.js";

export let PATH = "/bin";

export function shell_run(input) {
	const raw = input.trim();
	puts(`$ ${raw}`);
	if (!raw) return;
	
	const args = raw.split(/\s+/);
	const cmd = args[0];

	try {
		let node = null;

		if (cmd.includes('/')) {
			node = vfs_resolve(cmd).node;
		} else {
			const search_paths = ENV.PATH.split(':');
			for (const dir of search_paths) {
				try {
					const full_path = `${dir}/${cmd}`;
					node = vfs_resolve(full_path).node;
					break;
				} catch (err) { continue; }
			}
		}

		if (!node) throw new Error(`command not found`);
		if (typeof(node.data) !== "function") throw new Error(`${cmd}: cannot execute file`);
		if (!vfs_check_perm(node, P.EXEC)) throw new Error("EACCESS: permission denied");
		node.data(args);
	} catch (err) {
		const msg = err.message.includes("ENOENT") ? 
			`command not found: ${cmd}` :
			err.message;
		puts(`sh: ${msg}`);
	}
}

