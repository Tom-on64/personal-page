import { ctx, dentry, IS_DIR, S, vfs_mode_str, vfs_normalize_path, vfs_read, vfs_readdir, vfs_resolve, vfs_stat } from "./vfs.js";
import { format_date } from "./util.js";
import { cls, puts } from "./io.js";

function bin_cat(args) {
	if (args <= 1) {
		puts(`${args[0]}: could not read from stdin`);
		return;
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
	}
}

function bin_clear() { cls(); }

function bin_echo(args) { puts(args.join(' ')); }

function bin_exit(args) { puts(`${args[0]}: permission denied`); }

function bin_ls(args) {
	let dir = ctx.cwd;
	if (args.length > 1) dir = args[1]; // TODO: ls all specified dirs

	try {
		puts(vfs_readdir(dir).join("  "));
	} catch (err) {
		puts(`${args[0]}: ${err.message}`);
	}
}

function bin_ping() { puts("pong!"); }

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

function bin_sh(args) { puts(`${args[0]}: could not start nested session`); }

const bins = [
	dentry("cat",	 S.IFREG | 0o755, 0, 0, bin_cat),
	dentry("cd",	 S.IFREG | 0o755, 0, 0, bin_cd),
	dentry("clear",	 S.IFREG | 0o755, 0, 0, bin_clear),
	dentry("echo",	 S.IFREG | 0o755, 0, 0, bin_echo),
	dentry("exit",	 S.IFREG | 0o755, 0, 0, bin_exit),
	dentry("ls",	 S.IFREG | 0o755, 0, 0, bin_ls),
	dentry("ping",	 S.IFREG | 0o755, 0, 0, bin_ping),
	dentry("pwd",	 S.IFREG | 0o755, 0, 0, bin_pwd),
	dentry("reboot", S.IFREG | 0o755, 0, 0, bin_reboot),
	dentry("stat",	 S.IFREG | 0o755, 0, 0, bin_stat),
	dentry("sh",	 S.IFREG | 0o755, 0, 0, bin_sh),
];

export default bins;

