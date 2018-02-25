let escape = (str, text) => {
	str = String(str)
		.replace(/\\/g, '\\\\')
		.replace(/\//g, '\\/')
		.replace(/\|/g, '\\p')
		.replace(/\n/g, '\\n')
		.replace(/\r/g, '\\r')
		.replace(/\t/g, '\\t')
		.replace(/\v/g, '\\v')
		.replace(/\f/g, '\\f')
		.replace(/ /g, '\\s')

	if(text) {
		str = str.split('\\s').join(' ')
	}

	return str
}

let unescape = (str) => {
	return String(str)
		.replace(/\\\\/g, '\\')
		.replace(/\\\//g, '/')
		.replace(/\\p/g, '|')
		.replace(/\\n/g, '\n')
		.replace(/\\r/g, '\r')
		.replace(/\\t/g, '\t')
		.replace(/\\v/g, '\v')
		.replace(/\\f/g, '\f')
		.replace(/\\s/g, ' ')
}

let assembleCommandParams = (params) => {
	if(typeof params == 'string') {
		return params
	}
	if(params instanceof Array) {
		return params.join(' ')
	}
	if(typeof params == 'object') {
		let args = Object.keys(params)
		let result = []

		args.forEach((arg) => {
			result.push(escape(arg) + '=' + escape(params[arg]))
		})

		return result.join(' ')
	}
}

let disassembleCommandParams = (params) => {
	let args = params
	let result = {}

	args.forEach((arg) => {
		let cmd = arg.split('=')
		result[unescape(cmd[0])] = unescape(cmd[1])
	})

	return result
}

module.exports = {
	escape,
	unescape,
	assembleCommandParams,
	disassembleCommandParams
}