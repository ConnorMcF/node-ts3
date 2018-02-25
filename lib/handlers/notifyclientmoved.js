const Utils = require('../utils')
const Event = require('../event')
const User = require('../models/user')

const Const = require('../const')
const Channel = require('../models/channel')

module.exports = async (ts3, args) => {
	let params = Utils.disassembleCommandParams(args.slice(1))

	let event = new Event('clientMove', {
		user: await ts3.cache.fetch(Const.CACHE_TYPE.USER, params),
		channel: ts3.channels.find(ch => ch.cid == params.ctid)
	})
	ts3.emit('clientMove', event)
}