/*
 * Miscelaneous utilities
 * (c) Tom-on 2026
 */

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
