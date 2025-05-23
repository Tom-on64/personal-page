G.header = document.getElementById("header");
G.footer = document.getElementById("footer");

G.UI.header.forEach(e => {
	const elem = document.createElement("a");
	elem.innerText = e.text;
	elem.href = e.link;
	
	G.header.appendChild(elem);
});

G.UI.footer.forEach(e => {
	const elem = document.createElement("a");
	elem.innerText = e.text;
	elem.href = e.link;

	G.footer.appendChild(elem);
});

