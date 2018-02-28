/**
 * Teamspeak event
 *
 * @class TS3Event
 * @constructor
 * @private
 */
let TS3Event = function(type, data) {
	/**
	 * Event type
	 *
	 * @property type
	 * @type String
	 */
	this.type = type

	/**
	 * Client
	 *
	 * @property client
	 * @type Client
	 */

	/**
	 * Channel
	 *
	 * @property channel
	 * @type Channel
	 */
	
	Object.keys(data).forEach((key) => {
		this[key] = data[key]
	})
}

module.exports = TS3Event