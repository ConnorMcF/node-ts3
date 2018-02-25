const Utils = require('../utils')
const Event = require('../event')
const Client = require('../models/client')

const Const = require('../const')
const Channel = require('../models/channel')

module.exports = async (ts3, args) => {
	let params = Utils.disassembleCommandParams(args.slice(1))

	let client = await ts3.cache.fetch(Const.CACHE_TYPE.CLIENT, params)

	let oldChannel = ts3.channels.find(ch => ch.cid == client.cid)
	let newChannel = ts3.channels.find(ch => ch.cid == params.ctid)

	oldChannel.clients.splice(oldChannel.clients.indexOf(client), 1)
	newChannel.clients.push(client)

	client.cid = newChannel.cid
	client.channel = newChannel

	let event = new Event('clientMove', {
		client,
		channel: newChannel
	})
	ts3.emit('clientMove', event)
}