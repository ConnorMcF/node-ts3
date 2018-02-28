const Utils = require('../utils')
const Event = require('../event')
const Client = require('../models/client')

const Const = require('../const')
const Channel = require('../models/channel')

module.exports = async (ts3, args) => {
	let params = Utils.disassembleCommandParams(args.slice(1))

	await ts.getChannels()
	
	let event = new Event('channelDelete', {
		client: await ts3.cache.fetch(Const.CACHE_TYPE.CLIENT, params),
		channel: ts3.channels.find(ch => ch.cid == params.ctid)
	})

	ts3.emit('channelDelete', event)
}