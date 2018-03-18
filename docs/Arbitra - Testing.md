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



### Test 5 - Connected to backup

#### Method

1. Go to `app-settings` and click "Clear cache"
2. Restart the application
3. Wait

#### Expected Outcomes

1. After 60 seconds, a ping is sent to the backup server
2. A ping is sent back and stored etc

#### Proof



### Test 6 - Mine a block

#### Method

1. Navigate to the `mine` page
2. Click "Start"
3. Wait

#### Expected Outcomes

1. Out

