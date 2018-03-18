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

`connections.json`:

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

Success with minor visual bug

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

### Test 7 - Make a transaction

#### Method

1. Navigate to `make` page
2. Enter the public key of "Test Wallet"
3. Select "My Wallet"
4. Enter 25
5. Click "Send"

#### Expected Outcome

1. Transaction is created and sent without errors
2. Transaction is added to `history` page

#### Test Result

Success

#### Proof

![test 7.1](https://i.imgur.com/slhC3uy.png)

![test 7.2](https://i.imgur.com/eHHlaza.png)

![test 7.3](https://i.imgur.com/9kg2qoS.png)

`txpool.json`:

```json
[{"to":"bafad16bb7479e2827859c489a38c0bedeef96ce8a1aec201901394d16d1783b-bbddd2a5ef17608dfed16b2d351398ee3d208e215129dfa02b777ee2c801dcc0","from":[{"wallet":"ad003b2393f396d69540886ebf5ab888f0c89e64cbb8415b5ad6ac1a10f890f77c9ec603e255437e6daffe3ed0c67c41f9798778eec952e5214acaa4a6762a16","amount":25000000,"signature":"6bfe755218cd424bfe452e55ccb347604cf0e5c92b238a3f57b1b65e7b3211c51dfa483fcf64e236253256283000b79f582ba151a02a2281acb0af953ca1f5c"}],"time":1521399948482}]
```

### Test 8 - Add a transaction to blockchain

#### Method

1. Navigate to the `mine` page
2. Click "Start"
3. Wait until a block has been mined

#### Expected Outcomes

1. The balance of the wallets should be split 25 - 125
2. The transaction should appear in the blockchain viewing page

#### Test Result

Success

#### Proof

![test 8.1]()

![test 8.2]()

![test 8.3]()

### Test 9 - Save wallets.json

#### Method

1. Navigate to the `app-settings` page
2. Click "Save wallets"

#### Expected Outcomes

1. Save dialog appears
2. `wallets.json` is saved to the place selected

#### Test Result

Success

#### Proof



### Test 10 - Invalid transaction

#### Method

1. Navigate to the `make` page
2. Enter amount that exceed's the wallet's total amount
3. Click "Send"

#### Expected Outcomes

1. Error message displayed

#### Test Result

Success

#### Proof

![test 10.1](https://i.imgur.com/yyJQa7H.png)

![test 10.2](https://i.imgur.com/JIucRGw.png)

