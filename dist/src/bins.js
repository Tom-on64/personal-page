import { ctx, dentry, IS_DIR, S, vfs_mode_str, vfs_normalize_path, vfs_read, vfs_readdir, vfs_resolve, vfs_stat } from "./vfs.js";
import { history_get } from "./history.js";
import { format_date } from "./util.js";
import { cls, puts } from "./io.js";
import { open_window } from "./window.js";
import { getopt } from "./getopt.js";

function bin_cat(args) {
	if (args <= 1) {
		puts(`${args[0]}: could not read from stdin`);
		return 1;
	}

	for (let i = 1; i < args.length; i++) {
		const arg = args[i];
		try {
			const { type, data } = vfs_read(arg);
			if (type !== "string") puts(`${arg}: binary file`);
			else puts(data);
		} catch (err) {
			puts(`${args[0]}: ${err.message}`);
		}
	}
}

function bin_cd(args) {
	let dir = "/home/user"; // TODO: Parse /etc/passwd to find home dir
	if (args.length > 1) dir = args[1];
	
	try {
		const { node } = vfs_resolve(dir);
		if (!IS_DIR(node)) puts(`${args[0]}: ENOTDIR: not a directory`);
		else ctx.cwd = vfs_normalize_path(dir);
	} catch (err) {
		puts(`${args[0]}: ${err.message}`);
		return 1;
	}

	return 0;
}

function bin_clear() { cls(); }

function bin_echo(args) { puts(args.join(' ')); }

function bin_exit(args) { puts(`${args[0]}: permission denied`); }

function bin_history(args) {
	let limit;
	if (args.length > 1) limit = parseInt(args[1]);
	const history = history_get();
	let entries = history;


	if (limit) entries = history.slice(-limit);
	if (limit === 6) window.open("https://limit6.eu/");

	entries.forEach((cmd, idx) => {
		const disp_idx = history.length - entries.length + idx + 1;
		puts(`${disp_idx.toString().padStart(5, ' ')} ${cmd}`);
	});
}

function bin_ls(args) {
	let list_all = false;
	let long = false;

	const { options, operands } = getopt(args.slice(1), "alhrtR1");
	list_all = options.some(o => o.opt === "a");
	long = options.some(o => o.opt === "l");
	const human = options.some(o => o.opt === "h");
	const reverse = options.some(o => o.opt === "r");
	const by_time = options.some(o => o.opt === "t");
	const recursive = options.some(o => o.opt === "R");
	const one = options.some(o => o.opt === "1");

	const human_size = (n) => {
		if (!human) return String(n);
		const units = ["B", "K", "M", "G"];
		let i = 0, v = n;
		while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
		return `${v.toFixed(1)}${units[i]}`;
	};

	const stat_for = (dir, f) => vfs_stat(`${dir}/${f}`.replace("//", "/"));

	const dir_listing = function(dir, prefix = "") {
		try {
			let listing = vfs_readdir(dir);
			if (!list_all) listing = listing.filter(f => (f[0] !== '.'));

			const entries = listing.map(f => {
				let info = null;
				try { info = stat_for(dir, f); } catch (e) {}
				return { name: f, info };
			});

			if (by_time) entries.sort((a, b) => (b.info?.mtime - a.info?.mtime) || a.name.localeCompare(b.name));
			else entries.sort((a, b) => a.name.localeCompare(b.name));
			if (reverse) entries.reverse();

			if (recursive) {
				puts(`${dir}:`);
			}

			if (long) {
				entries.forEach(e => {
					const info = e.info;
					if (!info) { puts(`${e.name}`); return; }
					puts(`${vfs_mode_str(info.mode)}  ${human_size(info.size).padStart(6, ' ')}  ${e.name}`);
				});
			} else if (one) {
				entries.forEach(e => puts(e.name));
			} else {
				puts(entries.map(e => e.name).join("  "));
			}

			if (recursive) {
				for (const e of entries) {
					const full = `${dir}/${e.name}`.replace("//", "/");
					try {
						if (IS_DIR(vfs_resolve(full).node)) {
							puts("");
							dir_listing(full);
						}
					} catch (err) {}
				}
			}
		} catch (err) {
			puts(`${args[0]}: ${err.message}`);
			return 1;
		}
		return 0;
	};

	if (operands.length === 0) return dir_listing(ctx.cwd);
	if (operands.length === 1) return dir_listing(operands[0]);

	let rc = 0;
	operands.forEach((d, i) => {
		puts(`${d}:`);
		rc |= dir_listing(d);
		if (i < operands.length - 1) puts("");
	});
	return rc;
}

function bin_ping() { puts("pong!"); }

function bin_poweroff() {
	document.body.innerHTML = "";
}

function bin_pwd() { puts(ctx.cwd); }

function bin_reboot() { location.reload(); }

function bin_stat(args) {
	if (args.length <= 1) {
		puts(`${args[0]}: missing opperand`);
		return;
	}

	for (let i = 1; i < args.length; i++) {
		const arg = args[i];
		try {
			const info = vfs_stat(arg);
			puts(`  File: ${vfs_normalize_path(arg)}`);
			puts(`  Size: ${info.size}`);
			puts(`Access: (${(info.mode & 0o7777).toString(8).padStart(4, '0')}/${vfs_mode_str(info.mode)})  UID: (${info.uid})  GID: (${info.gid})`); // TODO: Add user and group strings
			puts(`Access: ${format_date(info.atime)}`);
			puts(`Modify: ${format_date(info.mtime)}`);
			puts(`Create: ${format_date(info.ctime)}`);
		} catch (err) {
			puts(`${args[0]}: ${err.message}`);
		}
	}
}

function bin_stercus() {
	const app = `<iframe src="https://jh.prihradka.cz/?embed" style="border:none;width:100%;height:100vh;"></iframe>`
	open_window(app, "stercus");
}

function bin_sh(args) { puts(`${args[0]}: could not start nested session`); }

const bins = [
	dentry("cat",	   S.IFREG | 0o755, 0, 0, bin_cat),
	dentry("cd",	   S.IFREG | 0o755, 0, 0, bin_cd),
	dentry("clear",	   S.IFREG | 0o755, 0, 0, bin_clear),
	dentry("echo",	   S.IFREG | 0o755, 0, 0, bin_echo),
	dentry("exit",	   S.IFREG | 0o755, 0, 0, bin_exit),
	dentry("history",  S.IFREG | 0o755, 0, 0, bin_history),
	dentry("ls",	   S.IFREG | 0o755, 0, 0, bin_ls),
	dentry("ping",	   S.IFREG | 0o755, 0, 0, bin_ping),
	dentry("poweroff", S.IFREG | 0o755, 0, 0, bin_poweroff),
	dentry("pwd",	   S.IFREG | 0o755, 0, 0, bin_pwd),
	dentry("reboot",   S.IFREG | 0o755, 0, 0, bin_reboot),
	dentry("stat",	   S.IFREG | 0o755, 0, 0, bin_stat),
	dentry("stercus",  S.IFREG | 0o755, 0, 0, bin_stercus),
	dentry("sh",	   S.IFREG | 0o755, 0, 0, bin_sh),
];

export default bins;

