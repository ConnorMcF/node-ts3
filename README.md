# node-ts3

> an abstracted teamspeak 3 server query client

[Documentation](http://connormcf.com/node-ts3/)

## Install

```bash
npm install ts3 -S
```

## Usage

```js
const TS3 = require('ts3')

const ts = new TS3()

ts.connect('127.0.0.1', 10011)
	.then(async () => {
		let auth = await ts.auth('serveradmin', 'supersecret', 1)
		console.log('authed', auth)

		ts.setName('node-ts3')

		ts.subscribe('server')
		ts.subscribe('channel', 1)
		ts.subscribe('textprivate')
	})

ts.on('clientJoin', (ev) => {
	ev.client.message('Hello ' + cv.client.nick + '!')
})
```

See additional examples in the [examples directory](https://github.com/ConnorMcF/node-ts3/tree/master/example).

## Documentation

Generated documentation is available from [connormcf.com/node-ts3](http://connormcf.com/node-ts3/).