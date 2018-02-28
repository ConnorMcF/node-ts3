const Utils = require('../utils')
const Event = require('../event')
const Client = require('../models/client')

const Const = require('../const')

module.exports = async (ts3, args) => {
	let params = Utils.disassembleCommandParams(args.slice(1))

	let client = await ts3.cache.fetch(Const.CACHE_TYPE.CLIENT, params)

	let event = new Event('clientJoin', {
		client
	})
	ts3.emit('clientJoin', event)
}