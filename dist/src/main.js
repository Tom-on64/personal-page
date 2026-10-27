import { S, P, vfs_init, dentry, vfs_read, vfs_write } from "./vfs.js";
import { history_read } from "./history.js";
import { io_init, puts } from "./io.js";
import bins from "./bins.js";
import ENV from "./env.js";

const file_passwd = "root:x:0:0:superuser:/root:shell\nuser:x:1000:1000:normal user:/home/user:shell";
const file_group = "root:x:0:root\nuser:x:1000:";
const file_history = "cat /root/yeah.txt\nls /bin";
const file_README = "README\n======\nHello, World!\n";
const file_runme = () => {
	const state = `${ENV.HOME}/.local/state/counter`;
	let n = 0;
	try { 
		let read = vfs_read(state); 
		n = parseInt(read.data);
	} catch (err) { console.log(err); }
	puts(`Run counter: ${++n}`);
	try { vfs_write(state, n.toString(), true); } catch (err) { console.log(err); }
}

const root = dentry("/", S.IFDIR | 0o755, 0, 0, [
	dentry("bin", S.IFDIR | 0o755, 0, 0, bins),
	dentry("boot", S.IFDIR | 0o700, 0, 0, []),
	dentry("dev", S.IFDIR | 0o755, 0, 0, []),
	dentry("etc", S.IFDIR | 0o755, 0, 0, [
		dentry("group", S.IFREG | 0o644, 0, 0, file_group),
		dentry("passwd", S.IFREG | 0o644, 0, 0, file_passwd),
	]),
	dentry("home", S.IFDIR | 0o755, 0, 0, [
		dentry("user", S.IFDIR | 0o700, 1000, 1000, [
			dentry(".cache", S.IFDIR | 0o700, 1000, 1000, [
				dentry("history", S.IFREG | 0o664, 1000, 1000, file_history),
			]),
			dentry(".config", S.IFDIR | 0o700, 1000, 1000, []),
			dentry(".local", S.IFDIR | 0o700, 1000, 1000, [
				dentry("share", S.IFDIR | 0o700, 1000, 1000, []),
				dentry("state", S.IFDIR | 0o700, 1000, 1000, []),
			]),
			dentry("README", S.IFREG | 0o664, 1000, 1000, file_README),
			dentry("runme", S.IFREG | 0o755, 1000, 1000, file_runme),
		]),
	]),
	// dentry("lib", S.IFDIR | 0o777, 0, 0, []),
	dentry("root", S.IFDIR | 0o750, 0, 0, [
		dentry("yeah.txt", S.IFREG | 0o664, 0, 0, "How the FUCK did you get here?!?"),
	]),
	dentry("tmp", S.IFDIR | 0o777 | P.STICKY, 0, 0, []),
]);

async function main() {
	vfs_init(root);
	io_init("con-in", "con-out", "main");
	history_read();
}

export default main;

