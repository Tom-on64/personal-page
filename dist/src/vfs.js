/*
 * Simple VFS implementation 
 * (c) Tom-on 2026
 */

// TODO: Move this somewhere
export const ctx = {
	uid: 1000,
	gid: 1000,
	cwd: "/home/user",
	root_node: null,
};

// Filetype constants
export const S = {
	IFMT:	0o170000, // Filetype bitmask
	IFIFO:	0o010000, // FIFO/named pipe
	IFCHR:	0o020000, // Character device
	IFDIR:	0o040000, // Directory
	IFBLK:	0o060000, // Block device
	IFREG:	0o100000, // Regular file
	IFLNK:	0o120000, // Symbolic link
	IFSOCK:	0o140000, // Socket
};
export const P = {
	SUID:	0o004000, // Set UID
	SGID:	0o002000, // Set GID
	STICKY:	0o001000, // Sticky
	READ:	4,
	WRITE:	2,
	EXEC:	1,
};

// The main component of the VFS, a directory entry
export const dentry = (name, mode, uid, gid, data) => ({
	name,
	mode, 
	uid, 
	gid, 
	data,
	atime: new Date(),
	mtime: new Date(),
	ctime: new Date(),
});

// Helpers
export const IS_FIFO	= (node) => ((node.mode & S.IFMT) === S.IFIFO);
export const IS_CHRDEV	= (node) => ((node.mode & S.IFMT) === S.IFCHR);
export const IS_DIR 	= (node) => ((node.mode & S.IFMT) === S.IFDIR);
export const IS_BLKDEV	= (node) => ((node.mode & S.IFMT) === S.IFBLK);
export const IS_FILE	= (node) => ((node.mode & S.IFMT) === S.IFREG);
export const IS_LINK	= (node) => ((node.mode & S.IFMT) === S.IFLNK);
export const IS_SOCK	= (node) => ((node.mode & S.IFMT) === S.IFSOCK);

export const IS_SUID	= (node) => ((node.mode & 0o7000) === P.SUID);
export const IS_SGID	= (node) => ((node.mode & 0o7000) === P.SGID);
export const IS_STICKY	= (node) => ((node.mode & 0o7000) === P.STICKY);

export function vfs_mode_str(mode) {
	let str = "";

	switch (mode & S.IFMT) {
	case S.IFIFO:	str += 'p'; break;
	case S.IFCHR:	str += 'c'; break;
	case S.IFDIR:	str += 'd'; break;
	case S.IFBLK:	str += 'b'; break;
	case S.IFREG:	str += '-'; break;
	case S.IFLNK:	str += 'l'; break;
	case S.IFSOCK:	str += 's'; break;
	default:	str += '?'; break;
	}

	for (let i = 0; i < 3; i++) {
		const p = mode >> (3 * i) & 7;

		if (p & P.READ) str += 'r';
		else str += '-';

		if (p & P.WRITE) str += 'w';
		else str += '-';

		if ((i === 0 && mode & P.SUID) || (i === 1 && mode & P.SGID)) str += 's';
		else if (i === 2 && mode & P.STICKY) str += '-';
		else if (p & P.EXEC) str += 'x';
		else str += '-';
	}
	return str;
}

// VFS implementation
export function vfs_normalize_path(path) {
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

export function vfs_check_perm(node, req) {
	if (ctx.uid === 0) return true;
	if (req === P.SUID || req == P.SGID || req == P.STICKY) return (perms & req) === req;

	let perms = node.mode;
	if (ctx.uid === node.uid) perms >>= 6;
	else if (ctx.gid == node.gid) perms >>= 3;
	
	return (perms & req) === req;
}

export function vfs_resolve(path) {
	const norm = vfs_normalize_path(path);
	if (norm == '/') return { node: ctx.root_node, parent: null };

	const parts = norm.split('/').filter((p) => (p !== ''));
	let current = ctx.root_node;
	let parent = null;

	parts.forEach(p => {
		if (!IS_DIR(current)) throw new Error("ENOTDIR: not a directory");
		if (!vfs_check_perm(current, P.EXEC)) throw new Error("EACCESS: permission denied");

		parent = current;
		current = current.data.find((d) => (d.name === p));

		if (!current) throw new Error("ENOENT: no such file or directory");
	});

	return { node: current, parent };
}

export function vfs_stat(path) {
	const { node } = vfs_resolve(path);

	return {
		name: node.name,
		mode: node.mode,
		uid: node.uid,
		gid: node.gid,
		atime: node.atime,
		mtime: node.mtime,
		ctime: node.ctime,
		size: (node.data.length || 0),
	};
}

export function vfs_read(path) {
	const { node } = vfs_resolve(path);

	if (IS_DIR(node)) throw new Error("EISDIR: is a directory");
	if (!vfs_check_perm(node, P.READ)) throw new Error("EACCESS: permission denied")

	return { type: typeof(node.data), data: node.data };
}

export function vfs_readdir(path) {
	const { node } = vfs_resolve(path);

	if (!IS_DIR(node)) throw new Error("ENOTDIR: not a directory");
	if (!vfs_check_perm(node, P.READ)) throw new Error("EACCESS: permission denied")

	return node.data.map(d => d.name);
}

export function vfs_creat(path) {
	const parts = vfs_normalize_path(path).split('/');
	const filename = parts.pop();
	const parent_path = parts.join('/') || '/';
	
	const parent = vfs_resolve(parent_path).node;
	if (!vfs_check_perm(parent, P.WRITE)) throw new Error("EACCESS: permission denied");

	node = dentry(filename, S_IFREG | 0o644, ctx.uid, ctx.gid, "");
	parent.data.push(node);

	return { node, parent };
}

export function vfs_write(path, data, creat = false) {
	let resolved;

	try {
		resolved = vfs_resolve(path);
	} catch (err) {
		if (err.message.startsWith("ENOENT") && creat) {
			resolved = vfs_creat(path);
		} else throw err;
	}

	const { node } = resolved;

	if (IS_DIR(node)) throw new Error("EISDIR: is a directory");
	if (!vfs_check_perm(node, P.WRITE)) throw new Error("EACCESS: permission denied");

	node.data = data;
}

// Init
export function vfs_init(root) {
	ctx.root_node = root;
}

