const Utils = require('../utils')
const Event = require('../event')
const User = require('../models/user')

module.exports = (ts3, args) => {
	let event = new Event('clientJoin', {
		user: new User(ts3, Utils.disassembleCommandParams(args.slice(1)))
	})
	ts3.emit('clientJoin', event)
}