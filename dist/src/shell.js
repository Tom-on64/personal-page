import { cls, puts } from "./io.js";
import { format_date } from "./util.js";
import { ctx, IS_DIR, vfs_mode_str, vfs_normalize_path, vfs_read, vfs_readdir, vfs_resolve, vfs_stat } from "./vfs.js";

export const cmds = {
	"cat": {
		fun: (args) => {
			if (args <= 0) {
				puts("cat: could not read from stdin.");
				return;
			}

			args.forEach(arg => {
				try {
					const { type, data } = vfs_read(arg);
					if (type !== "string") puts(`${arg}: binary file`);
					else puts(data);
				} catch (err) {
					puts(`cat: ${err.message}`);
				}
			})
		},
		help: "Concatenates one or more files.",
	},
	"cd": {
		fun: (args) => {
			let dir = "/home/user"; // TODO: Parse /etc/passwd to find home dir
			if (args.length > 0) dir = args[0];
			
			try {
				const { node } = vfs_resolve(dir);
				if (!IS_DIR(node)) puts("cd: ENOTDIR: not a directory");
				else ctx.cwd = vfs_normalize_path(dir);
			} catch (err) {
				puts(`cd: ${err.message}`);
			}
		},
		help: "Change the working directory."
	},
	"clear": {
		fun: () => { cls(); },
		help: "Clears the screen.",
	},
	"echo": {
		fun: (args) => { puts(args.join(' ')); },
		help: "Prints it's arguments.",
	},
	"exit": {
		fun: () => { puts("exit(): Permission denied."); },
		help: "Exits the current session.",
	},
	"help": {
		fun: () => {
			puts("Available commands:")
			Object.keys(cmds).forEach(cmd => {
				puts(` ${cmd}\t\t${cmds[cmd].help}`)
			});
		},
		help: "Prints this help message.",
	},
	"ls": {
		fun: (args) => {
			let dir = ctx.cwd;
			if (args.length > 0) dir = args[0]; // TODO: ls all specified dirs

			try {
				puts(vfs_readdir(dir).join("  "));
			} catch (err) {
				puts(`ls: ${err.message}`);
			}
		},
		help: "Lists files in working or specified directory.",
	},
	"ping": {
		fun: () => { puts("pong!"); },
		help: "Runs a ping.",
	},
	"pwd": {
		fun: () => { puts(ctx.cwd); },
		help: "Prints the current working directory.",
	},
	"reboot": {
		fun: () => { location.reload(); },
		help: "Reboots the system.",
	},
	"stat": {
		fun: (args) => {
			if (args.length <= 0) {
				puts("stat: missing opperand");
				return;
			}

			args.forEach(arg => {
				try {
					const info = vfs_stat(arg);
					puts(`  File: ${vfs_normalize_path(arg)}`);
					puts(`  Size: ${info.size}`);
					puts(`Access: (${(info.mode & 0o7777).toString(8).padStart(4, '0')}/${vfs_mode_str(info.mode)})  UID: (${info.uid})  GID: (${info.gid})`); // TODO: Add user and group strings
					puts(`Access: ${format_date(info.atime)}`);
					puts(`Modify: ${format_date(info.mtime)}`);
					puts(`Create: ${format_date(info.ctime)}`);
				} catch (err) {
					puts(`stat: ${err.message}`);
				}
			})
		},
		help: "Display file status.",
	}
};

export function shell_run(raw) {
	puts("$ " + raw);
	if (raw === "") return;
	
	const args = raw
		.split(' ')
		.filter((e) => (e !== ''));

	const cmd = args.shift();
	if (cmds[cmd]) cmds[cmd].fun(args);
	else puts("Unknown command.");
}

