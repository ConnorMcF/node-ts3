const Utils = require('../utils')
const Event = require('../event')
const User = require('../models/user')

const Channel = require('../models/channel')

module.exports = (ts3, args) => {
	let params = Utils.disassembleCommandParams(args.slice(1))

	let event = new Event('clientMove', {
		user: new User(ts3, params),
		channel: ts3.channels.find(ch => ch.cid == params.ctid)
	})
	ts3.emit('clientMove', event)
}