/**
 * Teamspeak command
 *
 * @class TS3Command
 * @constructor
 * @private
 */

let TS3Command = function(cmd, promise) {
	/**
	 * Command string
	 *
	 * @property cmd
	 * @type String
	 */
	this.cmd = cmd
	/**
	 * Command resolve
	 *
	 * @property resolve
	 * @type Function
	 */
	this.resolve = null
	/**
	 * Command reject
	 *
	 * @property reject
	 * @type Function
	 */
	this.reject = null
}

module.exports = TS3Command