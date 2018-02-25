const Utils = require('../utils')
const Event = require('../event')
const User = require('../models/user')

const Const = require('../const')

module.exports = (ts3, args) => {
	let params = Utils.disassembleCommandParams(args.slice(1))

	// ignore self
	if(params.clid == ts3.clientID) { return }

	if(params.targetmode == Const.TEXTMSG_TARGET_MODE.CLIENT) {
		let event = new Event('clientPrivateMessage', {
			user: new User(ts3, params),
			message: params.msg
		})
		ts3.emit('clientPrivateMessage', event)
		return
	}

	if(params.targetmode == Const.TEXTMSG_TARGET_MODE.CHANNEL) {
		let event = new Event('clientMessage', {
			user: new User(ts3, params),
			message: params.msg
		})
		ts3.emit('clientMessage', event)
		return
	}

	if(params.targetmode == Const.TEXTMSG_TARGET_MODE.SERVER) {
		let event = new Event('serverMessage', {
			user: new User(ts3, params),
			message: params.msg
		})
		ts3.emit('serverMessage', event)
		return
	}
}