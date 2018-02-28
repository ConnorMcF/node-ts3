/* 
 * restraining_order.js
 *
 * aka the reason this lib was made, hope
 * this helps your teamspeak adzter :^)
*/

const TS3 = require('../index') // require('ts3')

// nick or UUID
const RESTRAIN_AGAINST = "bad_person"
// nick or UUID
const RESTRAIN_FOR = "not_so_bad_person"
// stay x channels apart :^)
const RESTRAIN_DISTANCE = 2
// join msg
const WELCOME_MESSAGE = "Stay away from " + RESTRAIN_FOR + ". :^)"
// move msg (poke)
const MOVE_MESSAGE = "Too close to " + RESTRAIN_FOR + "!"

// create a new instance of node-ts3
const ts = new TS3()

// connect to the server
ts.connect('127.0.0.1', 10011)
	.then(async () => {
		// authenticate
		let auth = await ts.auth('serveradmin', 'supersecret', 1)

		// set bot name
		ts.setName('Restraining Order')

		// subscribe to channels
		ts.subscribe('server')
		ts.subscribe('channel', 0)
	})

// someone joined!
ts.on('clientJoin', (ev) => {
	// is this the person being restrained against?
	// if not we don't care
	if(!ev.client.nick == RESTRAIN_AGAINST || ev.client.uuid == RESTRAIN_AGAINST) { return }

	// find if the person who is being protected is online
	let clientFor = ts.clients.find((cl) => cl.nick == RESTRAIN_FOR || cl.uuid == RESTRAIN_FOR)

	// they are, warn the restrained
	if(clientFor) {
		ev.client.message(WELCOME_MESSAGE)
	}
})

// someone changed channel!
ts.on('clientMove', (ev) => {
	// is this the person being restrained against?
	// if not we don't care
	if(!ev.client.nick == RESTRAIN_AGAINST || ev.client.uuid == RESTRAIN_AGAINST) { return }

	// find both people
	let clientFor = ts.clients.find((cl) => cl.nick == RESTRAIN_FOR || cl.uuid == RESTRAIN_FOR)
	let clientAgainst = ts.clients.find((cl) => cl.nick == RESTRAIN_AGAINST || cl.uuid == RESTRAIN_FOR)

	// find index of channels
	let forChannel = ts.channels.indexOf(clientFor.channel)
	let againstChannel = ts.channels.indexOf(clientAgainst.channel)

	// they aren't both online, we don't care
	if(!clientFor || !clientAgainst) { return }

	// how many channels apart are they
	let distance = Math.abs(forChannel - againstChannel)

	// uh oh, too close!
	if(distance <= RESTRAIN_DISTANCE) {
		
		// find a suitable channel to move them to
		let moveChanUp = ts.channels[forChannel - RESTRAIN_DISTANCE]
		let moveChanDown = ts.channels[forChannel + RESTRAIN_DISTANCE]

		// decide which one to use and move them
		if(moveChanUp) {
			clientAgainst.move(moveChanUp)
		} else if(moveChanDown) {
			clientAgainst.move(moveChanDown)
		}

		// poke them and warn them
		clientAgainst.poke(MOVE_MESSAGE)
	}
})