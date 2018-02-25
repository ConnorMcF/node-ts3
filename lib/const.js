let TS3 = {
	GREET: [
		"TS3",
		"Welcome to the TeamSpeak 3 ServerQuery interface, type \"help\" for a list of commands and \"help <command>\" for information on a specific command."
	],
	OK: 'ok'
}

let TEXTMSG_TARGET_MODE = {
	'CLIENT': 1,
	'CHANNEL': 2,
	'SERVER': 3
}

let CACHE_TYPE = {
	'USER': 1
}

const mirror = (d) => { Object.keys(d).forEach((k) => d[k] = k); }

//mirror(TEXTMSG_TARGET_MODE)
mirror(CACHE_TYPE)

module.exports = {
	TS3,
	TEXTMSG_TARGET_MODE,
	CACHE_TYPE
}