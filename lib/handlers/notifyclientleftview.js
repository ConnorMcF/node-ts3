const Utils = require('../utils')
const Event = require('../event')
const Client = require('../models/client')

const Const = require('../const')

module.exports = async (ts3, args) => {
	let params = Utils.disassembleCommandParams(args.slice(1))

	let event = new Event('clientLeave', {
		client: await ts3.cache.fetch(Const.CACHE_TYPE.CLIENT, params),
		reason: params.reasonmsg
	})
	ts3.emit('clientLeave', event)
}