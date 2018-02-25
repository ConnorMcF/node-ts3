let Command = function(cmd, promise) {
	this.cmd = cmd
	this.resolve = null
	this.reject = null
}

module.exports = Command