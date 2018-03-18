## Testing

Since Arbitra's systems are very interconnected, I have decided to test them by attempting to perform a high level task then making sure that every bit along the way works.

For some of the tests, I installed Arbitra on a friend's PC, which was running 24/7 anyway for their project. Luckily for me, they had a static IP, so I used that for the backup server.

### Test 1 - Application fresh start#

#### Method

1. Delete the `arbitra-client` folder in `%APPDATA%\Roaming\arbitra-client`
2. Call `npm start`

#### Expected Outcomes

1. Application opens
2. `overview` page is automatically opened
3. A wallet is automatically created

#### Test Result

Success

#### Proof

![test 1.1](https://i.imgur.com/pw4bFFq.png)

![test 1.2](https://i.imgur.com/aYwC2yD.png)

### Test 2 - Creating a wallet

#### Method

1. Navigate to `wallets` page
2. Click on "Create new wallets"
3. Enter the name "Test Wallet"
4. Click "Create Wallet"

#### Expected Outcomes

1. `wallets-create` page opens
2. A wallet is created with the name "Test Wallet"

#### Test Result

Success

#### Proof

![test 2.1](https://i.imgur.com/URbs00w.png)

![test 2.2](https://i.imgur.com/z3tVFT5.png)

### Test 3 - Pinging a client

#### Method

1. Go to the `network-settings` page
2. Enter a valid IP
3. Click "Ping"

#### Expected Outcomes

1. A `pg` message is sent to the correct IP on port 2018
2. The hash of the message is added to `sent.json`
3. The client replies with a `pg` message
4. The IP is added to `connections.json`
5. The connections counter is incremented

#### Test Result

Success

#### Proof

![test 3.1](https://i.imgur.com/gt0nLiI.png)

![test 3.2](https://i.imgur.com/9FiYlgW.png)

```json
[{"ip":"5.81.186.90","advertise":"true"}]
```

### Test 4 - Automatic reconnecting

#### Method

1. Restart the application
2. Wait a few seconds

#### Expected Outcomes

1. The IP pinged in the last test is pinged again
2. The IP is added to `connections.json`
3. The connections counter is incremented

#### Test Result

Success

#### Proof

![test 4.1](https://i.imgur.com/GfDEi94.png)

### Test 5 - Connected to backup

#### Method

1. Go to `app-settings` and click "Clear cache"
2. Restart the application
3. Wait

#### Expected Outcomes

1. After 60 seconds, a ping is sent to the backup server
2. A ping is sent back and stored etc

#### Test Result

Success

#### Proof

![test 5.1](https://i.imgur.com/KFezlva.png)

### Test 6 - Mine a block

#### Method

1. Navigate to the `mine` page
2. Click "Start"
3. Wait

#### Expected Outcomes

1. "Path received" and "Block form, mining initiated" are printed to the console
2. Hashing rate is printed every ten seconds
3. When block is found, it is printed to the console and then sent to connections
4. Receive `ok` message
5. 50au added to wallet
6. 50au displayed in the top left


#### Test Result

99% Success

#### Proof

![test 6.1](https://i.imgur.com/r6ILNGW.png)

I missed the first block it mined, so here is the second block

![test 6.2](https://i.imgur.com/QDKGdKP.png)

![test 6.3](https://i.imgur.com/ci1z7TI.png)

![test 6.4](https://i.imgur.com/5LIPiMR.png)

#### Issues

Since the `height` of a block is zero-indexed, the block length counter in the top left has an off by one error.

#### Fixes

In `blockchain.js`, change:

```javascript
document.getElementById('height').textContent = fullchain[best].height
```

to:

```javascript
document.getElementById('height').textContent = fullchain[best].height + 1
```

