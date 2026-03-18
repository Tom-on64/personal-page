/*
 * tomon.web.app (c) Tom-on 2026
 */

const main = document.getElementById("main");
const conIn = document.getElementById("con-in");
const conOut = document.getElementById("con-out");

const cmds = {
	"clear": {
		fun: () => {
			for (const child of [...main.children]) {
				if (child.id !== "console") child.remove();
			}
			conOut.innerHTML = "";
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
	"ping": {
		fun: () => { puts("pong!"); },
		help: "Runs a ping.",
	},
	"reboot": {
		fun: () => { location.reload(); },
		help: "Reboots the system.",
	},
};

const puts = (s) => {
	const line = document.createElement("p");
	line.innerText = s;
	conOut.appendChild(line);
}

document.addEventListener("click", () => { conIn.focus(); })
conIn.addEventListener("keydown", (e) => {
	if (e.key !== "Enter") return;
	
	const raw = conIn.value.trim();
	puts("$ " + raw);
	window.scrollTo(0, document.body.scrollHeight);
	conIn.value = "";
	if (raw === "") return;
	
	const args = raw
		.split(' ').
		filter((e) => (e !== ''));

	const cmd = args.shift();
	if (cmds[cmd]) cmds[cmd].fun(args);
	else puts("Unknown command.");
})

