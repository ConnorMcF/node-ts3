const Utils = require('../utils')
const Event = require('../event')
const User = require('../models/user')

const Const = require('../const')

module.exports = async (ts3, args) => {
	let params = Utils.disassembleCommandParams(args.slice(1))

	let event = new Event('clientLeave', {
		user: await ts3.cache.fetch(Const.CACHE_TYPE.USER, params),
		reason: params.reasonmsg
	})
	ts3.emit('clientLeave', event)
}