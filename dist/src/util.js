export function format_date(date) {
	const pad = (n) => n.toString().padStart(2, '0');

	const y = date.getFullYear();
	const m = pad(date.getMonth() + 1);
	const d = pad(date.getDate());
	const h = pad(date.getHours());
	const min = pad(date.getMinutes());
	const s = pad(date.getSeconds());
	
	return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

export function human_size(n) {
	const units = ["B", "K", "M", "G"];
	let i = 0, v = n;
	while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
	return `${v.toFixed(1)}${units[i]}`;
};

