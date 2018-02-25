const Utils = require('../utils')
const Event = require('../event')
const Client = require('../models/client')

const Const = require('../const')

module.exports = async (ts3, args) => {
	let params = Utils.disassembleCommandParams(args.slice(1))

	let event = new Event('clientJoin', {
		client: await ts3.cache.fetch(Const.CACHE_TYPE.CLIENT, params)
	})
	ts3.emit('clientJoin', event)
}