const Utils = require('../utils')
const Event = require('../event')
const User = require('../models/user')

module.exports = (ts3, args) => {
	let params = Utils.disassembleCommandParams(args.slice(1))

	let event = new Event('clientLeave', {
		user: new User(ts3, params),
		reason: params.reasonmsg
	})
	ts3.emit('clientLeave', event)
}