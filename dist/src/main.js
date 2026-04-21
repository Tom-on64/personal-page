import { io_init, puts } from "./io.js";
import { S, vfs_init, dentry } from "./vfs.js";
import bins from "./bins.js";

const file_passwd = "root:x:0:0:superuser:/root:shell\nuser:x:1000:1000:normal user:/home/user:shell";
const file_group = "root:x:0:root\nuser:x:1000:";
const file_README = "README\n======\nHello, World!\n";
let file_runme_n = 1;
const file_runme = () => { puts(`Run counter: ${file_runme_n++}`); }

const root = dentry("/", S.IFDIR | 0o755, 0, 0, [
	dentry("bin", S.IFDIR | 0o777, 0, 0, bins),
	dentry("etc", S.IFDIR | 0o755, 0, 0, [
		dentry("group", S.IFREG | 644, 0, 0, file_group),
		dentry("passwd", S.IFREG | 644, 0, 0, file_passwd),
	]),
	dentry("home", S.IFDIR | 0o755, 0, 0, [
		dentry("user", S.IFDIR | 0o700, 1000, 1000, [
			dentry("README", S.IFREG | 0o664, 1000, 1000, file_README),
			dentry("runme", S.IFREG | 0o755, 1000, 1000, file_runme),
		]),
	]),
	dentry("root", S.IFDIR | 0o750, 0, 0, [
		dentry("yeah.txt", S.IFREG | 0o664, 0, 0, "How the FUCK did you get here :)"),
	]),
]);

async function main() {
	vfs_init(root);
	io_init("con-in", "con-out", "main");
}

export default main;

