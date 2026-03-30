/*
 * tomon.web.app (c) Tom-on 2026
 */

const main = document.getElementById("main");
const con_in = document.getElementById("con-in");
const con_out = document.getElementById("con-out");

const puts = (s) => {
	const line = document.createElement("p");
	line.innerText = s;
	con_out.appendChild(line);
}

const ctx = {
	uid: 1000,
	gid: 1000,
	cwd: "/",
};

const PERM_READ = 4;
const PERM_WRITE = 2;
const PERM_EXEC = 1;

// TODO: merge attr and perm
const perm_to_str = (perm) => {
	let str = "";
	for (let i = 0; i < 3; i++) {
		const p = perm >> (3 * i) & 7;
		if (p & PERM_READ) str += 'r';
		else str += '-';
		if (p & PERM_WRITE) str += 'w';
		else str += '-';
		if (p & PERM_EXEC) str += 'x';
		else str += '-';
	}
	return str;
}

const ATTR_FILE = 0;
const ATTR_DIRECTORY = 1;

const dentry = (name, attr, perm, uid, gid, data) => ({ name, attr, perm, uid, gid, data });

const file_README = "README\n======\nTry seeing what's inside ./test";
const file_runme = () => { puts("Hello, World!!"); }
const file_passwd = "root:x:0:0:superuser:/:shell\nuser:x:1000:1000:normal user:/:shell";
const file_group = "root:x:0:root\nuser:x:1000:";

const filesystem = [
	dentry("README", ATTR_FILE, 0o644, 0, 0, file_README),
	dentry("test", ATTR_DIRECTORY, 0o755, 0, 0, [
		dentry("test.txt", ATTR_FILE, 0o644, 0, 0, "Hello, World!"),
		dentry("runme", ATTR_FILE, 0o755, 0, 0, file_runme),
	]),
	dentry("etc", ATTR_DIRECTORY, 0o755, 0, 0, [
		dentry("passwd", ATTR_FILE, 0o311, 0, 0, file_passwd),
		dentry("group", ATTR_FILE, 0o311, 0, 0, file_group),
	]),
];

const root_node = dentry("/", ATTR_DIRECTORY, 0o755, 0, 0, filesystem);

const normalize_path = (path) => {
	const abs = path.startsWith('/');
	const base = abs ? '/' : ctx.cwd;
	const full = abs ? path : `${base}/${path}`;


	const parts = full.split('/').filter((p) => (p !== '' && p !== '.'));
	const resolved = [];

	parts.forEach(p => {
		if (p === "..") resolved.pop();
		else resolved.push(p);
	});

	return '/' + resolved.join('/');
}

const check_perm = (node, req) => {
	if (ctx.uid === 0) return true;

	let perms = node.perm;
	if (ctx.uid === node.uid) perms >>= 6;
	else if (ctx.gid == node.gid) perms >>=3;
	
	return (perms & req) === req;
}

const resolve_node = (path) => {
	const norm = normalize_path(path);
	if (norm == '/') return { node: root_node, parent: null };

	const parts = norm.split('/').filter((p) => (p !== ''));
	let current = root_node;
	let parent = null;

	parts.forEach(p => {
		if (current.attr !== ATTR_DIRECTORY) throw new Error("ENOTDIR: not a directory");
		if (!check_perm(current, PERM_EXEC)) throw new Error("EACCESS: permission denied");

		parent = current;
		current = current.data.find((d) => (d.name === p));

		if (!current) throw new Error("ENOENT: no such file or directory");
	});

	return { node: current, parent };
}

const fs_stat = (path) => {
	const { node } = resolve_node(path);

	return {
		name: node.name,
		attr: node.attr,
		perm: node.perm,
		uid: node.uid,
		gid: node.gid,
		size: typeof(node.data) ? node.data.length : 0
	};
}

const fs_read = (path) => {
	const { node } = resolve_node(path);

	if (node.attr === ATTR_DIRECTORY) throw new Error("EISDIR: is a directory");
	if (!check_perm(node, PERM_READ)) throw new Error("EACCESS: permission denied")

	return { type: typeof(node.data), data: node.data };
}

const fs_readdir = (path) => {
	const { node } = resolve_node(path);

	if (node.attr !== ATTR_DIRECTORY) throw new Error("ENOTDIR: not a directory");
	if (!check_perm(node, PERM_READ)) throw new Error("EACCESS: permission denied")

	return node.data.map(d => d.name);
}

const fs_creat = (path) => {
	const parts = normalize_path(path).split('/');
	const filename = parts.pop();
	const parent_path = parts.join('/') || '/';
	
	const parent = resolve_node(parent_path).node;
	if (!check_perm(parent, PERM_WRITE)) throw new Error("EACCESS: permission denied");

	node = dentry(filename, ATTR_FILE, 0o644, ctx.uid, ctx.gid, "");
	parent.data.push(node);

	return { node, parent };
}

const fs_write = (path, data, creat = false) => {
	let resolved

	try {
		resolved = resolve_node(path);
	} catch (err) {
		if (err.message.startsWith("ENOENT") && creat) {
			resolved = fs_creat(path);
		} else throw err;
	}

	const { node } = resolved;

	if (node.attr === ATTR_DIRECTORY) throw new Error("EISDIR: is a directory");
	if (!check_perm(node, PERM_WRITE)) throw new Error("EACCESS: permission denied");

	node.data = data;
}

const cmds = {
	"cat": {
		fun: (args) => {
			if (args <= 0) {
				puts("cat: could not read from stdin.");
				return;
			}

			args.forEach(arg => {
				try {
					const { type, data } = fs_read(arg);
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
			let dir = "/"; // TODO: Parse /etc/passwd to find home dir
			if (args.length > 0) dir = args[0];
			
			try {
				const { node } = resolve_node(dir);
				if (node.attr !== ATTR_DIRECTORY) puts("cd: ENOTDIR: not a directory");
				else ctx.cwd = normalize_path(dir);
			} catch (err) {
				puts(`cd: ${err.message}`);
			}
		},
		help: "Change the working directory."
	},
	"clear": {
		fun: () => {
			for (const child of [...main.children]) {
				if (child.id !== "console") child.remove();
			}
			con_out.innerHTML = "";
		},
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
				puts(fs_readdir(dir).join("  "));
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
					const info = fs_stat(arg);
					puts(`  File: ${info.name}`);
					puts(`  Size: ${info.size}  ${(info.attr == ATTR_FILE) ? "regular file" : "directory"}`);
					puts(`Access: (${info.perm.toString(8)}/${perm_to_str(info.perm)})  UID: (${info.uid})  GID: (${info.gid})`); // TODO: Add user and group strings
					// TODO:
					// puts(`Access: `);
					// puts(`Modify: `);
					// puts(`Create: `);
				} catch (err) {
					puts(`stat: ${err.message}`);
				}
			})
		},
		help: "Display file status.",
	}
};

document.addEventListener("click", () => { con_in.focus(); })
con_in.addEventListener("keydown", (e) => {
	if (e.key !== "Enter") return;
	
	const raw = con_in.value.trim();
	puts("$ " + raw);
	con_in.value = "";
	if (raw === "") {
		window.scrollTo(0, document.body.scrollHeight);
		return;
	}
	
	const args = raw
		.split(' ')
		.filter((e) => (e !== ''));

	const cmd = args.shift();
	if (cmds[cmd]) cmds[cmd].fun(args);
	else puts("Unknown command.");

	window.scrollTo(0, document.body.scrollHeight);
})

