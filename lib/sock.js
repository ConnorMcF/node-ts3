const net = require('net')
const Utils = require('./utils')
const Const = require('./const')

const Command = require('./command')
const Handlers = require('./handlers')

/**
 * Teamspeak socket
 *
 * @class TS3Sock
 * @constructor
 * @private
 */
let TS3Sock = function(ts3, conf) {
	let sock = new net.Socket()

	/**
	 * Connect to a teamspeak server
	 *
	 * @method connect
	 * @private
	 * @param {String} ip
	 * @param {Number} port
	 * @return {Socket} Listen for connected event instead
	 */
	this.connect = async (ip, port) => {
		try {
			return sock.connect(port, ip, () => {})
		} catch(err) {
			this.emit('error', err)
		}
	}

	/**
	 * Event queue
	 *
	 * @property queue
	 * @private
	 * @type Command[]
	 */
	let queue = []
	/**
	 * Queue buffer
	 *
	 * @property queueBuffer
	 * @private
	 * @type String[]
	 */
	let queueBuffer = []

	/**
	 * Send a raw command
	 *
	 * @method send
	 * @private
	 * @param {String} action
	 * @param {String} params
	 * @return {Promise} Resolves on success
	 */
	this.send = async (action, params) => {
		let args = await Utils.assembleCommandParams(params)
		let data = action + (params ? ' ' + args : '')

		let cmd = new Command(data)
		let promise = new Promise((resolve, reject) => {
			cmd.resolve = resolve
			cmd.reject = reject
		})

		queue.push(cmd)

		// start processing the queue
		if(queue.length == 1) {
			processQueue()
		}

		return promise
	}

	/**
	 * Process next item in command queue
	 *
	 * @method processQueue
	 * @private
	 * @return {Promise} Resolves on success
	 */
	let processQueue = () => {
		if(queue.length == 0) { return }
		let cmd = queue[0]

		sock.write(cmd.cmd + '\n')

		if(conf.debug) { console.log('\x1b[35m' + JSON.stringify(cmd.cmd) + '\x1b[0m') }
	}

	/**
	 * Process inbound data from server query
	 *
	 * @method processBuffer
	 * @private
	 */
	let processBuffer = () => {
		let data = queueBuffer
		queueBuffer = []

		let joinedData = data[0]
		if(data.length != 1) {
			joinedData = data.slice(0, data.length - 1).join('')
		}

		let args = joinedData.split(' ')

		let params = Utils.disassembleCommandParams(args) // (args.slice(1))

		if(data.length == 1) {

			if(params.msg == Const.TS3.OK) {
				queue[0].resolve(params.msg)
			} else {
				queue[0].reject(Utils.unescape(params.msg))
			}

			queue.splice(0, 1)
			processQueue()
			return
		}

		let doneArgs = data[data.length - 1].split(' ')
		let doneParams = Utils.disassembleCommandParams(doneArgs.slice(1))

		if(joinedData.indexOf('|') != -1) {
			params = joinedData.split('|').map((item) => {
				return Utils.disassembleCommandParams(item.split(' '))
			})
		}

		if(doneParams.msg == Const.TS3.OK) {
			queue[0].resolve(params)
		} else {
			queue[0].reject(Utils.unescape(doneParams.msg))
		}

		queue.splice(0, 1)
		processQueue()
		return

	}

	sock.on('data', (data) => {
		data = data.toString().substr(0, data.length - 2).split('\n\r')

		if(data[0] == Const.TS3.GREET[0]) {
			return this.emit('connected')
		}

		data.forEach((data) => {
			if(conf.debug) { console.log('\x1b[33m' + JSON.stringify(data) + '\x1b[0m') }

			let params = data.split(' ')

			// if it's an event handle it
			if(params[0].substr(0, 6) == 'notify') {
				if(Handlers[params[0]]) {
					Handlers[params[0]](ts3, params)
					return
				} else {
					console.warn('Unhandled TS3 event: ' + params[0])
				}
			}
			
			
			// other wise assume it's from queue
			queueBuffer.push(data)

			if(params[0] == 'error') {
				processBuffer()
			}
		})

		
	})

	/**
	 * Emitted when the serverquery is ready
	 *
	 * @event connected
	 */

	/**
	 * Emitted when the serverquery is ready
	 *
	 * @event sockConnected
	 */

	sock.on('connect', () => {
		this.emit('sockConnected')
	})

	/**
	 * Emitted when an error occurs
	 *
	 * @event error
	 * @param {Error} err
	 */

	sock.on('error', (err) => {
		this.emit('error', err)
	})

}

require('util').inherits(TS3Sock, require('events').EventEmitter)

module.exports = TS3Sock