export function getopt(args, optstring) {
	const options = [];
	const operands = [];

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === "--") {
			operands.push(...args.slice(i + 1));
			break;
		}

		if (arg === '-' || arg[0] !== '-') {
			operands.push(arg);
			continue;
		}

		for (let j = 1; j < arg.length; j++) {
			const opt = arg[j];
			const idx = optstring.indexOf(opt);

			if (idx === -1) throw new Error(`invalid option -- '${opt}'`);

			if (optstring[idx + 1] !== ":") {
				options.push({ opt, arg: null });
				continue;
			}

			let value;
			if (j + 1 < arg.length) {
				value = arg.slice(j + 1);
				j = arg.length - 1;
			} else {
				value = args[++i];
				if (value === undefined) throw new Error(`option requires an argument -- '${opt}'`);
			}
			options.push({ opt, arg: value });
		}
	}

	return { options, operands };
}
