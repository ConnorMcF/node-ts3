# node-ts3

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
```