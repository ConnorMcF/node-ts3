const Utils = require('../utils')
const Event = require('../event')
const Client = require('../models/client')

const Const = require('../const')

module.exports = async (ts3, args) => {
	let params = Utils.disassembleCommandParams(args.slice(1))

	let client = await ts3.cache.fetch(Const.CACHE_TYPE.CLIENT, params)

	// ignore self
	if(params.clid == ts3.clientID) { return }

	if(params.targetmode == Const.TEXTMSG_TARGET_MODE.CLIENT) {
		let event = new Event('clientPrivateMessage', {
			client,
			message: params.msg
		})
		ts3.emit('clientPrivateMessage', event)
		return
	}

	if(params.targetmode == Const.TEXTMSG_TARGET_MODE.CHANNEL) {
		let event = new Event('clientMessage', {
			client,
			message: params.msg
		})
		ts3.emit('clientMessage', event)
		return
	}

	if(params.targetmode == Const.TEXTMSG_TARGET_MODE.SERVER) {
		let event = new Event('serverMessage', {
			client,
			message: params.msg
		})
		ts3.emit('serverMessage', event)
		return
	}
}