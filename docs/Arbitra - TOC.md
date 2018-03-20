---
title: Arbitra
description: A cryptocurrency designed for an A-Level Computer Science Non Examined Assessment
---

# Arbitra

An A-level Computer Science project by Samuel Newman

[TOC]

## Introduction

### Project Aims

### Languages and software

### Names

#### Usage

## Analysis

### Research

### A brief introduction to Cryptocurrencies

#### More on wallets

### Objectives

### Basic Protocol

### Prototyping Core Functions

#### Hashing and Blocks

### Elliptic Curve Digital Signature Algorithm

##### Disclaimer

#### Elliptic Curves

##### Point Addition

###### Finding the line between a and b

###### Finding the third point

###### Python Implementation

###### Point at Infinity

##### Point Multiplication

###### The Pattern

###### The Solution

#### Finite Fields

##### Implementing Modular Inverse 

##### mod p

###### Side note regarding notation

###### Graphs and mod p

###### Things we know about the point at infinity

##### Objectifying

#### Back to Cryptography

##### Picking a curve

##### Curve Characteristics

##### Creating a signature

##### Verifying a signature

##### Verifying the program

#### Conclusion

### Networking

### Application planning

#### Concept

##### Concept 1

##### Concept 2

##### Concept 3

#### Pages

##### Key

## Documented Design

### How the network system works

### A closer look at the Protocol

#### Data types

#### Header

#### Message types

##### Transaction

##### Block

##### Ping

##### Node Request

##### Latest Block Hash Request

##### Chain Request

#### Reply types

##### Ping reply

##### Chain

##### Block hash

##### Node

##### Received

#### Error Message

#### Network diagrams

##### Simulation 1: From S1

##### Simulation 2: From S1

### User Interface Design

#### Concept 1

##### Redesign

#### Source code

##### HTML - index.html

##### CSS - style.css

##### Lists

### Creating the Electron app

#### Removing the Frame

#### Changing pages

##### Highlighting Menu Links

### The crypto Module

### Networking

#### Server Example

#### Client Example

```javascript
var client = new net.Socket();
client.connect(80, "127.0.0.1", function() {
    client.write("Hash this string please")
    client.on("data", function(data) {
        console.log("Client received: " + data)
        client.destroy()
    });
    client.on("close", function() {
        console.log("Connection closed")
    })
})
```

The client creates a socket which we connect to the same port as our server, and the IP `127.0.0.1`, which is the loopback address, meaning it connects to itself without leaving the machine. When it connects, it sends to the server "hash this string please" using `client.write()`. Using an event listener once again, it prints to the console whatever data that it receives, then destroys the socket. It then uses another event listener to detect that event and print "Connection closed" to the console.

Running the program creates this output:

![client/server model](https://i.imgur.com/6mIfStP.png)

This simply model clearly demonstrates how we can use the `net` module in order to send data from client to client.

However, we need a system that determines what messages need to be sent. I made some flowcharts to map the logic that the program should follow:

```flow
st=>start
end=>end
con1=>condition: Are there any nodes
in the connection list?
op1=>operation: Attempt connection
con2=>condition: Did it
connect?
op2=>operation: Get nodes from
hardcoded server
con3=>condition: Did any
connect?
io=>inputoutput: Throw error
sub=>subroutine: Remove node

st->con1
con1(yes)->op1
con1(no)->op2
con2(no)->sub
sub(right)->con1
op2->con3
con3(yes)->end
con3(no)->io
io(right)->op2
op1->con2
con2(yes)->end
```

When it connects, it will then go through this flowchart:

```flow
st=>start
end=>end
io1=>inputoutput: Ask for latest
block hash
con1=>condition: Is local copy
up to date?
io2=>inputoutput: Ask for for missing block

st->io1
io1->con1
con1(no)->io2
io2(right)->con1
con1(yes)->end
```

Then there are also the other message functions that the client can receive, which are:

- Receive a transaction - verify, add to block and send it on
- Receive a block - verify, add to the local blockchain and send it on
- Receive a block request - reply with block
- Receive a latest block hash request - reply with latest block hash
- Receive a ping - add to list of connections


### Data Files

The is a lot of data that we will need to store. The way that we do this is by storing it in the applications' `%APPDATA%` folder, which we can access using the `remote` module.

```javascript
var path = remote.app.getPath('appData')+'/arbitra-client/
```

We can then store data using the `fs` (File System) module, which will be covered during the Technical Solution phase.

Files will be in JSON (JavaScript Object Notation), because as the name suggests it is directly compatible with  

#### File Planning

There are several different files that we need to have. The obvious ones are listed here:

| Name                      | Description                                           | Type |
| ------------------------- | ----------------------------------------------------- | ---- |
| `blockchain.json`         | The blockchain                                        | `{}` |
| `connections.json`        | List of nodes that are currently connected            | `[]` |
| `recent-connections.json` | Nodes that have been connected to                     | `[]` |
| `sent.json`               | Sent messages so they aren't resent                   | `[]` |
| `network-setting.json`    | Settings options                                      | `{}` |
| `error-log.json`          | Stores error messages                                 | `[]` |
| `txpool.json`             | Pending transactions that are used to generate blocks | `[]` |
| `wallets.json`            | Stores wallets                                        | `[]` |

The type indicates if the file will be in Array form or in Object literal form.

## Technical Solution

### Converting Python Code

#### ECDSA

First, we need to work out some of the differences between Python and Javascript. First of all, and most importantly, Javascript only supports numbers up to $2^{53}$, which is an issue considering $\log_2n = 256$, a significantly larger number. Whereas Python handles this automatically, we need to use a library to handle the large numbers that we have to use. I chose [https://www.npmjs.com/package/big-integer](https://www.npmjs.com/package/big-integer), as it has a `mod()` function, which others that I looked at lacked.

Installing via `npm`:

```shell
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client>npm install --save big-integer
arbitra-client@0.1.1 C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client
`-- big-integer@1.6.26

npm WARN arbitra-client@0.1.1 No description
npm WARN arbitra-client@0.1.1 No repository field.
npm WARN arbitra-client@0.1.1 No license field.
```

We then `require()` it at the top of the document.

```javascript
const bigInt = require('big-integer')
```

 Secondly, JS has no tuples. Therefore, we need to represent points as an object literal.

```javascript
var point = {x=20,y=21}
```

We can then get the $x$ value by calling `point.x` to get `20`. JS also has support for `Infinity`, which we can use as the point at infinity.

Thirdly, while JS does have classes, it would probably be better to just have the curve characteristics as a `const` and not have the functions in a class. The curve therefore looks like:

```javascript
// elliptic curve secp256k1
const curve = {
    a: bigInt('0'),
    b: bigInt('7'),
    p: bigInt('115792089237316195423570985008687907853269984665640564039457584007908834671663'),
    g: {
        x: bigInt('55066263022277343669578718895168534326250603453777594175500187360389116729240'),
        y: bigInt('32670510020758816978083085130507043184471273380659243275938904335757337482424')
    },
    n: bigInt('115792089237316195423570985008687907852837564279074904382605163141518161494337')
}
```

When we want $p$, for example, we would call `curve.p`.

I put `curve` and `sha256()` into a new file called `ecdsa.js`, in the `/js/` folder, which will contain all our ECDSA code.

Fourthly, we want to make sure that this code runs **asynchronously**. This means that that the rest of the client can do whatever it wants, while this signature code runs for as long as is wants without disrupting the rest of the program. To do this, we use callback functions. These work by instead of returning a value at the end of a function, we instead pass a different function to the the first function which it then passes values to.

Finally, we need random numbers

In Python, we used `random.randrange` to generate the private key and $k$. However, there is no equivalent function in `crypto`.  We could use `crypto.randomBytes()` to determine the secret key, as it claims to be cryptographically strong. However, since it needs to be less than $n$, a naïve approach might be to `% curve.n`.

```javascript
var random = bigInt(crypto.randomBytes(256).toString(10))
// make sure it's less than n
var private = rand.mod(curve.n)
```

However, values more than $n$ would wrap around to be small numbers again, which produces an uneven distribution of random numbers, which is not random. While there are modules to do this, we're going to have to simply generate random numbers until they are less than $n$.

```javascript
function randomNum(min=1,max=curve.n) {
    var randomValue = max.add(1)
    while (randomValue.greater(max) || randomValue.lesser(min)) {
        // 32 bytes = 256 bits
        var buffer = crypto.randomBytes(32).toString('hex')
        randomValue = bigInt(buffer,16)
    }
    return randomValue
}
```

Note this function can be passed minimum and  maximum values, but default to $1$ and $n$, as that is all we need the function for.

##### `sha256()`

We need to convert the `sha256()` function we made earlier to return `bigInt`s. This is relatively easy.

```javascript
function sha256(data) {
    // creates a sha256 hash, updates it with data, and turns it into a bigint
    var hash = crypto.createHash('sha256').update(data).digest('hex')
    return bigInt(hash,16)
}
```

##### `onCurve()`

This one is pretty simple to translate. However, we have to use `big-integer`, so that means using `.minus()` instead of simply `-` etc.

```javascript
function onCurve(point) {
    // sees if point is on the curve y^2 = x^3 + ax + b
    if (point !== Infinity) {
        ysq = point.y.square()
        xcu = point.x.pow(3)
        ax = curve.a.multiply(point.x)
        if (ysq.minus(xcu).minus(ax).minus(curve.b).isZero()) {
            throw new Error('not on curve')
        }
    }
}
```

##### `invMod()`

`big-integer` has an `modInv()` function which is identical, but is designed to work specifically with `bigInt`s, so I decided to use that instead.

##### `addPoints()`

Now we have the other functions, we can implement `addPoints()`. Due to `big-integer`, it looks incredibly messy, although I tried to separate out the expressions a bit

```javascript
function addPoints(P1,P2) {
    onCurve(P1)
    onCurve(P2)
    var m,x,y
    // Point + Infinity = Point
    if (P1 === Infinity) {
        return P2
    } else if (P2 === Infinity) {
        return P1
    }
    if (P1.x === P2.x) {
        if (P1.y !== P2.y) {
            return Infinity
        } else {
            // finding gradient of tangent
            var t1 = bigInt(3).times(P1.x.square())
            var t2 = bigInt(2).times(P1.y)
            m = bigInt(t1.plus(curve.a)).times(t2.modInv(curve.p))
        }
    } else {
        // finding gradient of line between 2 points
        var t1 = P2.y.minus(P1.y)
        var t2 = P2.x.minus(P1.x)
        m = t1.times(t2.modInv(curve.p))
    }
    // calculating other interception point
    x = bigInt(m.square().minus(P1.x).minus(P2.x)).mod(curve.p)
    y = bigInt(bigInt(m.times(P1.x)).minus(P1.y).minus(m.times(x))).mod(curve.p)
    var P3 = {
        x: x,
        y: y
    }
    onCurve(P3)
    return P3
}

```

##### `multiPoints()`

With `multiPoints()`, we need to convert a number to binary then iterate through it. First of all, we need to get the binary number. Luckily, when we use `.toString()`, we can specify the base, in this case `.toString(2)`. Otherwise, the function is very similar to the Python version. `yranib` is the word "binary" reversed.

```javascript
function multiPoints(n, P) {
    if (P === Infinity) {
        return P
    }
    var total = Infinity
    var binary = n.toString(2)
    // reversed binary
    var yranib = binary.split('').reverse()
    // see documentation if confused, it's a bit mathsy
    // to explain in comments
    yranib.forEach(function(bit) {
        if (bit == 1) {
            total = addPoints(total, P)
        }
        P = addPoints(P, P)
        onCurve(P)
    })
    onCurve(total)
    return total
}
```

##### `createKeys()`

Now for the key creation function. Here is where we use `randomNum()`.

```javascript
function createKeys() {
    var rand = randomNum(1,curve.n)
    var private = rand % curve.n
    var public = multiPoints(private,curve.g)
    return {private = private, public = public}
}
```

However, `createKeys()` itself should be an asynchronous function, since `createKeys()` takes time to run and things rely on it. Therefore, I restructured it.

```javascript
function createKeys(callback) {
    var err
    try {
        var private = randomNum(1, curve.n)
        var public = multiPoints(private, curve.g)
    } catch (e) {
        err = e
    } finally {
        callback(public, private, err)
    }
}
```

This is now much simpler and should work much better down the road.

##### `signMsg()`

`signMsg()` also uses callbacks. It also catches any errors in the `multiPoints()` function, which would appear if `w` was an invalid number, and return a error to the callback. I also restructured the function around a while loop which is much easier to understand.

```javascript
function signMsg(msg,w,callback) {
    var err
    console.log("Signing: "+msg)
    var z = hash.sha256(msg)
    var r,s
    r = s = bigInt.zero
    while (r.isZero() && s.isZero()) {
        var k = randomNum(1, curve.n)
        try {
            var P = multiPoints(k,curve.g)
        } catch(e) {
            err = e
            callback(0,0,err)
            return
        }
        r = P.x.mod(curve.n)
        s = bigInt(bigInt(w.times(r).plus(z)).times(k.modInv(curve.n))).mod(curve.n)
    }
    callback(r,s,err)
}
```

##### `verifyMsg()`

`verifyMsg()` is also similar to it's Python equivalent

```javascript
function verifyMsg(msg,r,s,q,callback) {
    var result = false
    var z = hash.sha256(msg)
    u1 = bigInt(z.times(s.modInv(curve.n))).mod(curve.n)
    u2 = bigInt(r.times(s.modInv(curve.n))).mod(curve.n)
    try {
        P = addPoints(multiPoints(u1,curve.g),multiPoints(u2,q))
    } catch(e) {
        callback(result)
        return
    }
    result = bigInt(r.mod(curve.n)).equals(P.x.mod(curve.n))
    callback(result)
}
```

Finally, we can export the functions that the rest of the program will interact with: `createKeys()`, `signMsg()`, and `verifyMsg()`, as well as `curve` in case we need to reference the curve attributes somewhere else in the program.

```javascript
exports.curve = curve
exports.createKeys = createKeys
exports.signMsg = signMsg
exports.verifyMsg = verifyMsg
```

##### Testing

In `testing.js`, I added the following to `init()`:

```javascript
function init() {
    console.log("testing.js loaded")
    ecdsa.createKeys((public,private,err) => {
        if (err) {
            alert("Error: "+err)
            throw err
        } else {
            console.log(private.toString(16))
            console.log(public.x.toString(16))
            console.log(public.y.toString(16))
        }
    })
}
```

This returns:

```console
renderer.js:13 Page change: testing
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\js\testing.js:5 testing.js loaded
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\js\testing.js:11 64287b362b58ca40853292540e93d6233426d7113dd3e8eac7e4fa3bbf587c27
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\js\testing.js:12 dc07c1ba078ad9cd4231ed0d5b75a8cf2f7db601e665fe25e425d475b0737226
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\js\testing.js:13 155b51fdbb9207cbf6dc9904a6056412ccd8c62fd2bfbdecf1ba6e8942af65086
```

This appeared to work. We now need to test the message signing/verification to confirm that. I changed `init()` to this:

```javascript
function init() {
    console.log("testing.js loaded")
    ecdsa.createKeys((public,private,err) => {
        if (err) {
            alert("Error: "+err)
            throw err
        } else {
            console.log(private.toString(16))
            console.log(public.x.toString(16))
            console.log(public.y.toString(16))
            ecdsa.signMsg("bean",private,(r,s,err) => {
                if (err) {
                    alert("Error: "+err)
                    throw err
                } else {
                    console.log(r.toString(16))
                    console.log(s.toString(16))
                    ecdsa.verifyMsg("bean",r,s,public,(result) => {
                        console.log(result)
                    })
                }
            })
        }
    })
}
```

This creates keys, signs the message `"bean"`, then verifies the message, throwing any errors it picks up along the way. This returns:

```console
renderer.js:13 Page change: testing
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\js\testing.js:5 testing.js loaded
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\js\testing.js:11 2648d426958d128260e3b76934a54287119acb24d00f371d91fc354406cf7ac
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\js\testing.js:12 fff20f5fd4128e6f21cf5e344f9879bd92533e9e2c30ab841ce6732425d9fa98
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\js\testing.js:13 -5a430f49825fb7fde918327ed5d9618778ff9d48c5ab18277a2273695d18d923
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\js\ecdsa.js:110 Signing: bean
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\js\testing.js:19 998af03e55c252ee98144208c3e06e0c788065ad6a39f170943d5d577acddb4
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\js\testing.js:20 30f855da1ec7fe114e52ab4a0f9373893ded2801d151f5152daf4462a08af6dc
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\js\testing.js:22 true
```

This means that it works. We can now use `ecdsa.js` to sign and verify messages.

##### Simplifying Functions

While the mathematical aspect of the  function works, it is inconvenient to call from other parts of the program, since all the keys are in `bigInt` format within `ecdsa.js`, and are as hexadecimal strings everywhere else. Therefore, we need to change these functions so that they take in and return values that are compatible with the rest of the program. I started with `createKeys()`.

```javascript
function createKeys(callback) {
    var err
    try {
        var private = randomNum(1, curve.n)
        var public = multiPoints(private, curve.g)
        var x = public.x.toString(16)
        var y = public.y.toString(16)
        public = x+y
        private = private.toString(16)
    } catch (e) {
        err = e
    } finally {
        callback(public, private, err)
    }
}
```

Now it returns hexadecimal strings, so the rest of the program can take that output and use it without conversion.

Next we need to convert `signMsg()`. This is relatively simple, as it only took one `bigInt` as an argument. However, we also need to turn the signature into one hexadecimal string.

```javascript
function signMsg(msg,private,callback) {
    var err
    var w = bigInt(private,16)
    ...
```

Finally, the last outward-facing function is `verifyMsg()`. This is more complex, as we need to parse the signature, 

#### Hashing

We have already converted the `sha256()` function from Python in the ECDSA section of this document. However, since it is an important function, I put it in it's own file, `hashing.js`, which is located in the `/js/` directory. I then created two functions, one which returns a `bigInt`, and another which returns a hexadecimal string, and also set up the exports function.

```javascript
const crypto = require('crypto')
const bigInt = require('big-integer')

function sha256(data) {
    // creates a sha256 hash, updates it with data, and turns it into a bigint
    var hash = crypto.createHash('sha256').update(data).digest('hex')
    return bigInt(hash,16)
}

function sha256hex(data) {
    return sha256(data).toString(16)
}

exports.sha256 = sha256
exports.sha256hex = sha256hex
```

Now we can import our hashing function from all over the application.

### File

As mentioned previously, to avoid messages going in circles we need to store the hashes of received messages so that we don't resend it to people. For this, we will store in a JSON file the hash of the sent messages, along with the IP addresses that it has sent them to. The file will be in the following format:

```json
{
    "b3fa55f98fcfcaf6a15a7c4eb7cdd1b593693d3fef2fb7aec3b6768fd7c6a4ce": ["168.12.143.1","168.991.125.6"],
    "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824": ["127.0.0.1"]
}
```

By using the hash as a key, we can simply use `file[hash]` to retrieve the array of addresses that that message was sent to, which is far easier and more efficient than having to search for it.

The method by which you read and write to files in Node.js is using the `fs`  (file system) module, a default library. However, it is powerful but quite clumsy, so I created some functions that wrap around `fs`' functions that are better adapted to this project's needs. These are stored in `file.js`.

#### `store()`

First we need to import `fs` and `electron.remote` into `file.js`, since we need `remote` to get the file path of the `%APPDATA%` folder where the JSON files will be located.

```javascript
const remote = require('electron').remote
const fs = require('fs')
```

Then we make a new function called `store()`. This will open the JSON file, append a new hash, and then save it. We get the correct file path using `remote.app.getPath('appData')`. I had originally designed this function to just work for `sent.json`, but this is changed later.

```javascript
function store(key,data) {
    // put data in file
    var path = remote.app.getPath('appData')
    fs.readFile(path+'sent.json','utf-8',(err,contents) => {})  
}
```

Then we need to get the contents and `JSON.parse()` it, then add our new data.

```javascript
function store(key,data) {
    // put data in file
    var path = remote.app.getPath('appData')+'sent.json'
    fs.readFile(path,'utf-8',(err,content) => {
        if (err) throw err
        var jsondata = JSON.parse(content)
        jsondata.push(data)
        content = JSON.stringify(jsondata)
    })
}
```

We then rewrite `content` to the file.

```javascript
function store(key,data) {
    // put data in file
    var path = remote.app.getPath('appData')+'\\arbitra-client\\sent.json'
    fs.readFile(path,'utf-8',(err,content) => {
        if (err) {
            throw err
        } else {
            var jsondata = JSON.parse(content)
            jsondata[key] = data
            content = JSON.stringify(jsondata)
            fs.writeFile(path,content,'utf-8',(err) => {
                if (err) throw err
            })
        }
    })
}
```

However, this will throw an error if `sent.json` doesn't exist. We can fix this by catching the corresponding error (`ENOENT`) and creating a new file if that's the case. We do however have to put `content` into an array so it is in the correct format.

```javascript
function store(key,data) {
    // put data in file
    var path = remote.app.getPath('appData')+'\\arbitra-client\\sent.json'
    fs.readFile(path,'utf-8',(err,content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.log('Creating sent.json')
                var content = {key:data}
                content = JSON.stringify(content)
                fs.writeFile(path,content,'utf-8',(error) => {
                    if (error) throw error
                })
            } else {
                console.log(err.code)
                throw err
            }
        } else {
            var jsondata = JSON.parse(content)
            jsondata.push(data)
            content = JSON.stringify(jsondata)
            fs.writeFile(path,content,'utf-8',(err) => {
                if (err) throw err
            })
        }
    })
}
```

However, this doesn't quite work, when we call the function with the following input:

```javascript
var key = 'b3fa55f98fcfcaf6a15a7c4eb7cdd1b593693d3fef2fb7aec3b6768fd7c6a4ce'
var data = ['168.12.143.1','168.991.125.6']
store(key,data)
```

It creates `sent.json`, as expected...

```console
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\js\file.js:10 Creating sent.json
renderer.js:13 Page change: overview
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\js\overview.js:2 overview.js loaded
```

However, the actual contents of `sent .json` looks like this:

```json
[object Object]
```

This is an easy fix, as I simply forgot to `JSON.stringify(content)` when creating the file. However, it does raise the issue about how to deal with invalid data when opening `sent.json`. I decided restructure the function so that it would deal with unexpected errors better.

```javascript
function store(key,data) {
    // put data in file
    var path = remote.app.getPath('appData')+'\\arbitra-client\\sent.json'
    fs.readFile(path,'utf-8',(err,content) => {
        if (err) {
            // if the file doesn't exist, it sets content to an array
            // it will then continue on and create the file later
            if (err.code === 'ENOENT') {
                content = '{}'
            } else {
                alert('Error opening sent.json')
                throw err
            }
        }
        // try to parse content to js then push the data
        try {
            var jsondata = JSON.parse(content)
            jsondata[key] = data
        } catch(e) {
            console.warn(e)
            var jsondata = {key:data}
        }
        // writes the contents back to the file
        // or makes the file if it doesn't exist yet
        content = JSON.stringify(jsondata)
        fs.writeFile(path,content,'utf-8',(err) => {
            if (err) throw err
        })
    })
}
```

Now, the function opens `sent.json`, checks if there's an error, and if there's not it tries to parse the content. If it doesn't work, it uses an empty object. Finally, it puts the data into the object, turns it back into a string and writes this new string back into the file. If there is an error when reading the file, it checks to see if the error corresponds to the file not existing - if that's the case, it sets the content to `'{}'`, an empty object. Otherwise, it will throw an error.

It was at this point I realised that we will want to use this in other situations as well, such as to store wallets or the blockchain. I therefore made it take a third argument, `file`.

```javascript
const remote = require('electron').remote
const fs = require('fs')

function store(key,data,file) {
    // put data in file
    // no callbacks because it's a subroutine
    var path = remote.app.getPath('appData')+'\\arbitra-client\\'+file+'.json'
    fs.readFile(path,'utf-8',(err,content) => {
        if (err) {
            // if the file doesn't exist, it creates an empty object literal
            // it will then continue on and create the file later
            if (err.code === 'ENOENT') {
                content = '{}'
            } else {
                alert('Error opening '+file+'.json')
                throw err
            }
        }
        // try to parse content to js then push the data
        try {
            var jsondata = JSON.parse(content)
            jsondata[key] = data
        } catch(e) {
            console.warn(e)
            var jsondata = {key:data}
        } finally {
            // writes the contents back to the file
            // or makes the file if it doesn't exist yet
            content = JSON.stringify(jsondata)
            fs.writeFile(path,content,'utf-8',(err) => {
                if (err) throw err
            })
        }
    })
}

exports.store = store
```

Finally, we need to consider what happens when there the key already exists. We need to add the new data to the old data. To do this, we need to merge to two arrays. To do this, I found the best method was to first concatenate the arrays, then them into a set turn it into a `Set` then back into Javascript. We turn them into a `Set` in order to remove duplicates, as a `Set` will only accept unique values.

https://gist.github.com/telekosmos/3b62a31a5c43f40849bb#gistcomment-1826809

```javascript
        // try to parse content to js then push the data
        try {
            var jsondata = JSON.parse(content)
            if (jsondata.hasOwnProperty(key)) {
                // if the key exists it concatenates the two arrays, creates a new set
                // which removes duplicates, then turns it back to an array
                // https://gist.github.com/telekosmos/3b62a31a5c43f40849bb#gistcomment-1826809
                var set = new Set(jsondata[key].concat(data))
                jsondata[key] = Array.from(set)
            } else {
                // otherwise sets the key to the data
                jsondata[key] = data
            }
        } catch(e) {
            console.warn(e)
            var jsondata = {key:data}
        } finally {
            // writes the contents back to the file
            // or makes the file if it doesn't exist yet
            content = JSON.stringify(jsondata)
            fs.writeFile(path,content,'utf-8',(err) => {
                if (err) throw err
            })
        }
```

##### Removing arrays

If we want to make it truly generic, we need to get rid of the code relating to arrays, or at least put it in a separate function. I decided to solve this by adding a check to see what type `data` is. If it's an array, we do the concatenation thing with `Set`, otherwise we just replace it. I originally tried to do this using `typeof`, however upon testing, it simply returns `"object"` for arrays, which is a problem given that we want to differentiate between array objects and other objects.

```javascript
typeof ['hi']
"object"
```

However, I found out that we can simply use `Array.isArray()`, which returns a simple Boolean. I put this in the if statement with `jsondata.hasOwnProperty(key)`, so that it only does the concatenation thing if both the key exists and the data is an array.

```javascript
if (jsondata.hasOwnProperty(key) && Array.isArray(data)) {
    // if the key exists it concatenates the two arrays, creates a new set
    // which removes duplicates, then turns it back to an array
    // https://gist.github.com/telekosmos/3b62a31a5c43f40849bb#gistcomment-1826809
    var set = new Set(jsondata[key].concat(data))
    jsondata[key] = Array.from(set)
} else {
    // otherwise sets the key to the data
    jsondata[key] = data
}
```

Finally, I added an optional callback that is called when the file is written to. I did this by giving `callback` the default value of `()=>{}`, which is ES6 arrow notation for a function, meaning that if no argument is passed for callback an empty function is called instead.

```javascript
function store(key,data,file,callback=()=>{}) {
    // put data in file
    var path = remote.app.getPath('appData')+'/arbitra-client/'+file+'.json'
    fs.readFile(path,'utf-8',(err,content) => {
        if (err) {
            // if the file doesn't exist, it creates an empty object literal
            // it will then continue on and create the file later
            if (err.code === 'ENOENT') {
                content = '{}'
            } else {
                alert('Error opening '+file+'.json')
                throw err
            }
        }
        // try to parse content to js then push the data
        try {
            var jsondata = JSON.parse(content)
            if (jsondata.hasOwnProperty(key) && Array.isArray(data)) {
                // if the key exists it concatenates the two arrays, creates a new set
                // which removes duplicates, then turns it back to an array
                // https://gist.github.com/telekosmos/3b62a31a5c43f40849bb#gistcomment-1826809
                var set = new Set(jsondata[key].concat(data))
                jsondata[key] = Array.from(set)
            } else {
                // otherwise sets the key to the data
                jsondata[key] = data
            }
        } catch(e) {
            console.warn(e)
            var jsondata = {}
            jsondata[key] = data
        } finally {
            // writes the contents back to the file
            // or makes the file if it doesn't exist yet
            content = JSON.stringify(jsondata)
            fs.writeFile(path,content,'utf-8',(err) => {
                if (err) throw err
                callback()
            })
        }
    })
}
```

##### Testing

I tested this by calling `store('test',['data1','data2'],'test')`. This returned:

```json
{"test":["data1","data2"]}
```

In the file `C:\Users\Mozzi\AppData\Roaming\arbitra-client\test.json`.

Next I called `store('test2','hello','test')`.

```json
{"key":["data1","data2"],"test2":"hello"}
```

Strangely, the key `'test'` has been replaced by `'key'`. I guessed that it was an error relating to using `{key:data}` if there was an exception, so I replaced all instances of that with:

```javascript
var jsondata = {}
jsondata[key] = data
```

 and ran the same tests again. This ended up with:

```json
{"test":["data1","data2"]}
```

and then:

```json
{"test":["data1","data2"],"test2":"hello"}
```

We can now test the array concatenation. Calling `store('test',['data2','data3'],'test')` gave:

```json
{"test":["data1","data2","data3"],"test2":"hello"}
```

It worked!

#### `get()`

Now we need to retrieve data. This function is very similar, except instead of writing to the file at the end, it just calls the callback with the data it retrieved.

It also returns `null` if either the file or the key doesn't exist, which can be dealt with in the callback.

```javascript
function get(key,file,callback) {
    var path = remote.app.getPath('appData')+'\\arbitra-client\\'+file+'.json'
    fs.readFile(path,'utf-8',(err,content) => {
        if (err) {
            // if the file doesn't exist, return null
            if (err.code === 'ENOENT') {
                callback(null)
                return
            } else {
                alert('Error opening '+file+'.json')
                throw err
            }
        }
        // try to parse content to js then push the data
        try {
            var jsondata = JSON.parse(content)
            var result = jsondata[key]
        } catch(e) {
            // if the key doesn't exist, return null
            console.warn(e)
            var result = null
        } finally {
            callback(result)
            return
        }
    })
}
```

However, I noticed later on that returning `null` if no data is found was awkward to work around. I therefore added `fail`, which is an optional parameter which is returned if no data is found.

```javascript
function get(key,file,callback,fail=null) {
    var path = remote.app.getPath('appData')+'/arbitra-client/'+file+'.json'
    fs.readFile(path,'utf-8',(err,content) => {
        if (err) {
            // if the file doesn't exist, return null
            if (err.code === 'ENOENT') {
                console.warn(file+'.json not found')
                console.trace()
                callback(fail)
                return
            } else {
                alert('Error opening '+file+'.json')
                throw err
            }
        }
        // try to parse content to js then push the data
        try {
            var jsondata = JSON.parse(content)
            var result = jsondata[key]
        } catch(e) {
            // if the key doesn't exist, return null
            console.warn(e)
            var result = fail
        } finally {
            callback(result)
        }
    })
}
```

I also now exported the functions, so they can be used in other files.

```javascript
const remote = require('electron').remote
const fs = require('fs')

// functions go here

exports.store = store
exports.get = get
```

I realised that it would be helpful to add some more functions to deal with other problems. These ended up being:

- `getAll()`, a wrapper around `fs.readFile()`
- `storeAll()`, the corresponding wrapper around `fs.writeFile()`
- `append()`, which appends data to a file which contains an array rather than an object literal.

#### `getAll()`

This is simply stripping the complicated parts out of `get()`.

```javascript
function getAll(file,callback,fail=null) {
    var path = remote.app.getPath('appData')+'/arbitra-client/'+file+'.json'
    fs.readFile(path,'utf-8',(err,content) => {
        if (err) {
            // if the file doesn't exist, return null
            if (err.code === 'ENOENT') {
                console.warn(file+'.json not found')
                content = fail
            } else {
                alert('Error opening '+file+'.json')
                console.error('Error opening '+file+'.json')
                throw err
            }
        }
        callback(content)
    })
}

// this is at the bottom of the file with the others
exports.getAll = getAll
```

#### `storeAll()`

`storeAll()` is even simpler, as it just wraps `fs.writeFile()`.

```javascript
function storeAll(file,data,callback=()=>{}) {
    var path = remote.app.getPath('appData')+'/arbitra-client/'+file+'.json'
    content = JSON.stringify(data)
    fs.writeFile(path,content,'utf-8',(err) => {
        if (err) throw err
        callback()
    })
}
```

#### `append()`

Append is very similar to `get()`, but rather than dealing with objects that sometimes have arrays as data and using `Array.isArray()`, it simply appends the data to the file using `jsondata.push()` as the file is assumed to be an array rather than an object literal.

```javascript
function append(file,data,callback=()=>{}) {
    // write data to a file, but where the file is an array so no key
    var path = remote.app.getPath('appData')+'/arbitra-client/'+file+'.json'
    fs.readFile(path,'utf-8',(err,content) => {
        if (err) {
            // if the file doesn't exist, it creates an empty object literal
            // it will then continue on and create the file later
            if (err.code === 'ENOENT') {
                content = '[]'
            } else {
                alert('Error opening '+file+'.json')
                throw err
            }
        }
        // try to parse content to js then push the data
        try {
            var jsondata = JSON.parse(content)
            jsondata.push(data)
        } catch(e) {
            console.warn(e)
            var jsondata = [data]
        } finally {
            // writes the contents back to the file
            // or makes the file if it doesn't exist yet
            content = JSON.stringify(jsondata)
            fs.writeFile(path,content,'utf-8',(err) => {
                if (err) throw err
                callback()
            })
        }
    })
}
```

### Message Sending/Receiving

In the design phase we figured out how to use the `net` module to set up a TCP server. Now, we need to create a system where we can send and receive messages in the background of the application, all while the rest of the app does it's own stuff. First of all, I put the code from the design stage in it's own file, `network.js`. We can them import it into `renderer.js` to run in the background of the application.

```javascript
const net = require('net')
const hash = require('./hashing.js')

function init() {
    var server = net.createServer((socket) => {
        console.log("Server created")
        socket.on("data",(data) => {
            console.log("Server received: "+data)
            var hashed = hash.sha256hex(data)
            socket.write(hashed)
        })
        socket.on("end",socket.end)
    })
    
    server.listen(2018)
}

function sendMsg(message,ip) {
    var client = new net.Socket()
    client.connect(2018,ip,() => {
        client.write(message)
        client.on("data",(data) => {
            console.log("Client received: "+data)
            client.destroy()
        })
        client.on("close",() => {
            console.log("Connection closed")
        })
    })
}

exports.init = init
exports.sendMsg = sendMsg
```

Then in `renderer.js`, after it calls the `changePage()` function, I put this:

```javascript
const network = require('./js/network.js')

...

network.init()
network.sendMsg("hello","127.0.0.1")
```

This produced:

```console
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\js\network.js:6 Server created
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\js\network.js:8 Server received: hello
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\js\network.js:23 Client received: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\js\network.js:27 Connection closed
renderer.js:13 Page change: overview
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\js\overview.js:2 overview.js loaded
```

This is promising. We can run the `sendMsg()` function from anywhere and the server will reply. Now we need to structure the server so that it can reply as we want it to.

```javascript
var server = net.createServer((socket) => {
        console.log("Server created")
        socket.on("data",(data) => {
            console.log("Server received: "+data)
            parseMsg(data,(reply) => {
                socket.write(reply)
            })
        })
        socket.on("end",socket.end)
    })
```

This passes received data to the `parseMsg()` function, which should return a reply which the server then sends back. This will be created later. For testing purposes, it simply returns a hash of the input message.

```javascript
function parseMsg(data,callback) {
    callback(hash.sha256hex(data))
}
```

Since we'd never be sending one message at a time, I created a function that opens `connections.json` and sends a message to each of the IPs within, `sendToAll()`. It uses a function `file.getAll()` which I haven't created yet, but in summary it opens the file with the name passed to it, and returns the data in that file. This function calls `file.getAll()` to get `connections.json`, then iterates through the objects in the file using `forEach()`, and sends a message to each of them.

```javascript
function sendToAll(msg) {
    file.getAll('connections',(data) => {
        // doesn't do anything if there's no connections
        if (data !== null || data === '' || data === '[]') {
            nodes = JSON.parse(data)
            // go through connections and send a message to each
            nodes.forEach((node) => {
                sendMsg(msg,node.ip)
            })
        }
    })
}
```

But what causes clients to start sending messages in the first place? We need to make the system where it figures out the data it needs and starts asking for it without prompting. When the app starts up, it needs to do the following:

- try to connect to previously connected to nodes
- calculate account balance for the counter in the top left
- calculate the number of nodes we are connected to
- start a loop to continually check for nodes

I decided the best place for this is within the `network.init()` function, after we set the server running. First of all, we need to wipe `connections.json`, as this is meant to contain current connections and it is unknown if those connections are still there. Therefore, we remove it's contents when the application starts. This uses `file.storeAll()`, which stores an empty array.

```javascript
    // wipe connections
    // this will be populated with connections that succeed
    file.storeAll('connections',[])
```

Next, we need to connect to the nodes listed in `recent-connections.json`, to reaffirm that they are still around. I decided to put this in a function called `connect()`.

#### `connect()`

This is a fairly simple function, as it simply gets all the nodes in `recent-connections.json` and sends them a ping, if they're not currently connected to. However, I also wanted it to connect to the backup server if it couldn't find any connections. Therefore, after it sends the pings I wanted to see how many connections there are, and if there's none it should attempt to connect to the backup server. First, I ran into the issue of knowing how many connections I had. Initially, I tried a complex callback system but this ultimately failed.

I realised later that I could just use the connection counter in the top left corner. This is increased every time the client receives a ping, so if we read that we can tell how many connections the client has.

The second issue is that pings don't come back instantly. Therefore, I used the `setTimeout()` function to check the number of connections after 10000 milliseconds have passed.

Finally, the backup server is `5.81.186.90`. I also show the "WARNING: No connections" message until the ping has returned.

```javascript
function connect() {
    // try to connect to other nodes through old connections
    file.getAll('recent-connections',(data) => {
        var connections = JSON.parse(data)
        file.get('advertise','network-settings',(data) => {
            if (data === 'true' || data === 'false') {
                var advertise = data
            } else {
                var advertise = 'true'
            }
            var ping = {
                "header": {
                    "type": "pg"
                },
                "body": {
                    "advertise": advertise
                }
            }
            file.getAll('connections',(curdata) => {
                var current = JSON.parse(curdata)
                connections.forEach((node) => {
                    if (!current.includes(node)) {
                        sendMsg(ping,node.ip)
                    }
                })
            },'[]')
            
            // wait ten seconds to see if any connections have been made
            setTimeout(() => {
                // get the number of connections from textContent
                var connectCount = parseInt(document.getElementById('connections').textContent)
                if (connectCount === 0) {
                    console.warn('No connections found!')
                    document.getElementById('nonodes').classList.remove('hidden')
                    console.warn('Connecting to backup server')
                    // wavecalcs.com is friend's server, and should be online for the purposes of this project
                    // wavecalcs.com = 5.81.186.90
                    sendMsg(ping,'5.81.186.90')
                }
            },10000)
        })
    },'[]')
}
```

#### `setInterval()`

As per the list, the next thing we need to do is create a loop that sends out hash request messages and pings, where neccessary. Rather than use a `while` loop, I found that a better way of doing it was by using the `setInterval()` function, as then we can set a gap between the loops. I chose 60 seconds, or 60000 milliseconds.

What this function does it get the number of connections from the DOM, as mentioned previously, and also get the target number of connections from the settings file. Then, if the number of connections is less than the number of  target connections, it calls the `connect` function again. It then waits 15 seconds for that function to finish, then gets the number of connections again to see if it's over the threshold yet. If not, it sends out node requests to the connections in an attempt to get more nodes.

```javascript
    // this is a loop that maintains connections and
    // sends top hash requests to make sure the client is up to date
    // it goes on forever, every minute
    setInterval(() => {
        console.log('Interval')
        var connections = parseInt(document.getElementById('connections').textContent)
        // first check that we have enough connections
        file.get('target-connections','network-settings',(target) => {
            // if the current number of of connections is less than the minimum
            // as defined by user settings, connect
            if (connections < target) {
                connect()
                // if it's still not enough after 15 seconds, send node requests
                setTimeout(() => {
                    connections = parseInt(document.getElementById('connections').textContent)
                    if (connections < target) {
                        var nr = {
                            "header": {
                                "type": "nr"
                            },
                            "body": {}
                        }
                        sendToAll(nr)
                    }
                },15000)
            }
        },5) // if it fails to open the file it sets target to five
    },60000)
```

I also wanted it to send out hash requests, so I added that. On top of that, if connections is greater than the target, it needs to replace `recent-connections.json` with `connections.json`.

It only sends out hash requests if there are more than one connections. If there are no connections, it removes the `.hidden` classs from the "no connections" warning.

```javascript
// this is a loop that maintains connections and
// sends top hash requests to make sure the client is up to date
// it goes on forever, every minute
setInterval(() => {
    console.log('Interval')
    var connections = parseInt(document.getElementById('connections').textContent)
    // first check that we have enough connections
    file.get('target-connections','network-settings',(target) => {
        // if the current number of of connections is less than the minimum
        // as defined by user settings, connect
        if (connections < target) {
            connect()
            // if it's still not enough after 15 seconds, send node requests
            setTimeout(() => {
                connections = parseInt(document.getElementById('connections').textContent)
                if (connections < target) {
                    var nr = {
                        "header": {
                            "type": "nr"
                        },
                        "body": {}
                    }
                    sendToAll(nr)
                }
            },15000)
        } else {
            // save current connections to recent connections
            file.getAll('connections',(data) => {
                if (connections !== null) {
                    file.storeAll('recent-connections',JSON.parse(data))
                }
            })
        }
        connections = parseInt(document.getElementById('connections').textContent)
        if (connections === 0) {
            document.getElementById('nonodes').classList.remove('hidden')
        } else {
            // check that the chain is up to date
            var hr = {
                "header": {
                    "type": "hr"
                },
                "body": {}
            }
            sendToAll(hr)
        }
    },5) // if it fails to open the file it sets target to five
},60000)
```

### Message Parsing/Processing

Once a message has been received, we need to parse it and send it's information on into the system. We also need to ensure that a message is valid, as one of the critical parts of a cryptocurrency is ensuring that all messages are correct and valid.

First, I created an example message, that is a transaction.

```javascript
var message = {
  header: {
    type: "tx",
    hash: "b3fa55f98fcfcaf6a15a7c4eb7cdd1b593693d3fef2fb7aec3b6768fd7c6a4ce",
    size: 10
    version: "0.0.1"
    time: 12931802
  },
  body: {
    sender: "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    reciever: "b3fa55f98fcfcaf6a15a7c4eb7cdd1b593693d3fef2fb7aec3b6768fd7c6a4ce",
    amount: "12",
    time: 1516831879816
  }
}
```

This is  a JSON object that represents a transaction. Whilst it is not at all correct, we can use it for testing the system as we build it. The function that the server calls is called `parseMsg()`, and it takes the received data and a callback function. First of all, we need to be able to store sent transactions.

#### `parseMsg()`

The best way of doing this that I can think of is having a function for each message type. First, we need to create the if statement that handles this. First, it creates an object literal for the reply. It then attempts to parse the message into JSON. If it doesn't parse, it catches the error and calls the `er()` function, which takes the error message, which should set the reply to an error message. Otherwise, it checks the header type and calls the corresponding function. After the reply has been constructed, the header is created and then the reply is turned back to a string. Finally, it is passed to the callback function where it will be sent back to the sender.

```javascript
function parseMsg(data,callback) {
    var reply
    try {
        var msg = JSON.parse(data)
        if (msg.header.type === 'tx') {
            reply = tx(msg)
        } else if (msg.header.type === 'bk') {
            reply = bk(msg)
        } else if (msg.header.type === 'hr') {
            reply = hr(msg)
        } else if (msg.header.type === 'br') {
            reply = br(msg)
        } else if (msg.header.type === 'pg') {
            reply = pg(msg,ip)
        } else if (msg.header.type === 'nr') {
            reply = nr(msg,ip)
        } else {
            reply = er('type')
        }
    } catch(e) {
        if (e.name === 'SyntaxError') {
            console.warn(e)
            er('parse')
        } else {
            throw e
        }
    } finally {
        reply.header.time = Date.now()
        reply.header.hash = hash.sha256hex(JSON.stringify(reply.body))
        var replystr = JSON.stringify(reply)
        callback(replystr)
    }
}
```

First however, we can simplify this system slightly. Every message has a hash, so we can verify that once before we start parsing the messages. Therefore, I added the check before the if statements. If it fails, it will call `er()` with the error message of `'hash'`.

```javascript
try {
    var msg = JSON.parse(data)
    if (msg.header.hash === hash.sha256hex(JSON.stringify(msg.body))) {
        if (msg.header.type === 'tx') {
            tx(msg)
        } else if (msg.header.type === 'bk') {
            ...
        } else {
            er('type')
        }
    } else {
        er('hash')
    }
}
```

I also realised that we could use the `try...catch` statement to set the error reply, rather than using `er()`. If it runs into an error, it simply `throw`s the error, which will then be caught by the catch statement. By throwing what we want the return message to say, we can simply rewrite the `try...catch` statement like so:

```javascript
try {
    var msg = JSON.parse(data)
    if (msg.header.hash === hash.sha256hex(JSON.stringify(msg.body))) {
        if (msg.header.type === 'tx') {
            tx(msg)
        } else if (msg.header.type === 'bk') {
            ...
        } else {
            throw 'type'
        }
    } else {
        throw 'hash'
    }
} catch(e) {
    console.warn(e)
    reply.header.type = 'er'
    if (e.name === 'SyntaxError') {
        reply.body.err = 'parse'
    } else {
        reply.body.err = e
    }
}
```

We also need to find the size of the body. I found an answer on [StackOverflow](https://stackoverflow.com/a/27377098) that answered this question, using Node.js' `Buffer` - `Buffer.byteLength(string,'utf8')`. We put this at the end of the function.

```javascript
finally {
    reply.body.time = Date.now()
    reply.header.hash = hash.sha256hex(JSON.stringify(reply.body))
    reply.header.size = Buffer.byteLength(JSON.stringify(reply.body,'utf8'))
    var replystr = JSON.stringify(reply)
    callback(replystr)
}
```

#### Parsing Different Message Types

To make things a bit clearer, I decided to split these functions into a new file, `parse.js`, so that `parseMsg()` is more readable. However, this means that each of the functions like `tx()` will be converted to `parse.tx()`.

I imported the following files, as all are needed.

```javascript
const network = require('./network.js')
const hash = require('./hashing.js')
const ecdsa = require('./ecdsa.js')
const blockchain = require('./blockchain.js')
const file = require('./file.js')
```

The first of these functions is `pg()`. Since we need the IP of the node that sent it, we pass the IP as well as the message.

##### `pg()`

What we need to achieve with this function is:

- Add to `connections.json`, the file which contains active connections.
- Reply with a ping

However, since we need to do the first part again when we receive a ping as a reply, I decided to split it up into two functions, one which adds it to `connections.json`, and the other which replies with the ping. `pgreply()` adds the IP to `connections.json`, and `pg()` calls `pgreply()` and then returns the reply message.

First, I created `pgreply()`. First, it creates the object which it will store later on. Then, it gets all the connections using the `getAll()` function I made. It then iterates through the connections, and sets `repeat` to `true` if the IP that sent the message is already in connections. If `repeat` is false, meaning that it is not already connected to that node, then it appends the `store` object, which contains the IP and whether or not the node wants to be advertised.

```javascript
function pgreply(msg,ip) {
    var store = {}
    store['ip'] = ip
    store['advertise'] = msg.body.advertise
    file.getAll('connections',(data) => {
        var repeat = false
        // checks to see if the ip is already in connections.json
        nodes = JSON.parse(data)
        nodes.forEach((node) => {
            if (node.ip === ip) {
                repeat = true
            }
        })
        // stores it if not
        if (!repeat) {
            file.append('connections',store,() => {
                console.log('Connection added: '+ip)
            })
        }
    },'[]')
}
```

However, since we don't want to connect to ourselves, I decided to install the `ip` module and check if our IP is the same as the one we would be adding.

```shell
>npm install --save ip
```

We then check if it's the same

```javascript
        // stores it if not and if it is not our ip
        const ourip = require('ip').address
        if (!repeat && ip !== ourip()) {
            file.append('connections',store,() => {
                console.log('Connection added: '+ip)
            })
        }
```

Back to `pg()`. I created a new file in `%APPDATA%` called `network-settings.json`, and then added the following:

```json
{"advertise":"true"}
```

This will be automatically added later on.

We then `get()` this file, then set the reply message accordingly. It checks to see if `data` is either `'true'` or `'false'`, as I was having issues with that at an early stage.

```javascript
function pg(msg,ip,callback) {
    // store the connection
    pgreply(msg,ip)
    // send a reply
    var reply = {
        "header": {
            "type": "pg"
        },
        "body": {
            "advertise": advertise
        }
    }
    file.get('advertise','network-settings',(data) => {
        if (data === 'true' || data === 'false') {
            reply.body['advertise'] = data
        } else {
            reply.body['advertise'] = 'true'
        }
    })
    return reply
}
```

###### Testing

I decided to test the ping function by creating function in `testing.html` to ping an IP. `testing.html` looks like this:

```html
<h1>Testing Page</h1>

<input type="text" id="sendto"/>
<button id="send">Send ping</button>
```

`testing.js` is changed to this:

```javascript
const network = require('./network.js')

function init() {
    var msg = {
        "header": {
            "type": "pg",
        },
        "body": {
            "advertise": true
        }
    }
    document.getElementById('send').addEventListener('click',() => {
        network.sendMsg(msg,document.getElementById('sendto').value)
    })
}

exports.init = init
```

It creates a message, `msg`, then when the send button is clicked it sends `msg` to the value of the input box using `network.sendMsg()`.

Hopefully, if we send this ping to `localhost` we should see it print the same message twice, as the reply should be the same as what we sent.

```console
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\network.js:169 Sending message: {"header":{"type":"pg","version":"0.0.1","size":39,"hash":"e925d7387f58e2a27ea686946400f180e122c2b68094418241ef857ea74af151"},"body":{"advertise":true,"time":1520933329222}}
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\network.js:19 Received connection from: 127.0.0.1
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\network.js:20 Server received: {"header":{"type":"pg","version":"0.0.1","size":39,"hash":"e925d7387f58e2a27ea686946400f180e122c2b68094418241ef857ea74af151"},"body":{"advertise":true,"time":1520933329222}}
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\network.js:29 Sending message to 127.0.0.1: {"header":{"type":"pg","version":"0.0.1","size":39,"hash":"e0e72e4798fc24ccfc4c31178488ad7e801a80b02294024c1ae868c089be77d"},"body":{"time":1520933329271}}
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\network.js:178 Client received: {"header":{"type":"pg","version":"0.0.1","size":39,"hash":"e0e72e4798fc24ccfc4c31178488ad7e801a80b02294024c1ae868c089be77d"},"body":{"time":1520933329271}}
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\parse.js:194 Connection added: 127.0.0.1
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client\parse.js:194 Connection added: localhost
```

This looks mostly good. However, I noticed that in the reply, it doesn't reply with a value for `advertise`, which is a problem. Looking again at the code for `pg()`:

```javascript
function pg(msg,ip,callback) {
    // store the connection
    pgreply(msg,ip)
    // send a reply
    var reply = {
        "header": {
            "type": "pg"
        },
        "body": {
            "advertise": advertise
        }
    }
    file.get('advertise','network-settings',(data) => {
        if (data === 'true' || data === 'false') {
            reply.body['advertise'] = data
        } else {
            reply.body['advertise'] = 'true'
        }
    })
    return reply
}
```

The issue lies in `file.get()` - since the data is returned in a callback, and since callbacks are asyncronous, `reply.body.advertise` is being set to `data` *after* the reply is returned. My first solution was to move the `return reply` into the callback.

```javascript
function pg(msg,ip,callback) {
    // store the connection
    pgreply(msg,ip)
    // send a reply
    file.get('advertise','network-settings',(data) => {
        if (data === 'true' || data === 'false') {
            advertise = data
        } else {
            advertise = 'true'
        }
        var reply = {
            "header": {
                "type": "pg"
            },
            "body": {
                "advertise": advertise
            }
        }
        return reply
    })
}
```

However, since the callback is itself a function, this is simply returning `reply` to where it is called in `file.get()` rather than returning it back to `parseMsg()`. I struggled with this issue for quite a while, as I didn't know how to get the data from `file.get()` to return syncronously.

###### Restructuring `parseMsg()`

The solution, it turned out, does not use returns. Going back to `parseMsg()`, the callback is effectively a function that sends a reply. Therefore, rather than getting each file to return a reply, it is better to pass `callback()` to each of the `type` functions. Then, it creates a reply and passes it to the callback, rather than returning it back down to `parseMsg()`

In this way, the whole process is completely asyncronous as at no point is the program waiting for a function to finish.

The redesigned `parseMsg()` now catches any errors and appends the received data to a file called `error-logs` before sending a reply. It also sends `ip` to `pg()`, which will be passed to the function when it receives data.

```javascript
function parseMsg(data,ip,callback) {
    // parse incoming messages and replies
    // by calling parse functions
    try {
        var msg = JSON.parse(data)
        if (msg.header.hash === hash.sha256hex(JSON.stringify(msg.body))) {
            if (msg.header.type === 'tx') {
                // transaction
                // callback is used to send the reply
                parse.tx(msg,callback)
            } else if (msg.header.type === 'bk') {
                // block
                parse.bk(msg,callback)
            } else if (msg.header.type === 'hr') {
                // hash request
                parse.hr(msg,callback)
            } else if (msg.header.type === 'cr') {
                // chain request
                parse.cr(msg,callback)
            } else if (msg.header.type === 'pg') {
                // ping
                parse.pg(msg,ip,callback)
            } else if (msg.header.type === 'nr',callback) {
                // node request
                parse.nr(msg,ip,callback)
            } else {
                throw 'type'
            }
        } else {
            throw 'hash'
        }
    } catch(e) {
        // catching any errors and replying with an error message
        console.warn(e)
        var error
        if (e.name === 'SyntaxError') {
            error =  'parse'
        } else {
            error = e
        }
        var reply = {
            "header": {
                "type": "er"
            },
            "body": {
                "error": error
            }
        }
        file.append('error-logs',data)
        callback(reply)
    }
}
```

`pg()` now looks like this:

```javascript
function pg(msg,ip,callback) {
    // store the connection
    pgreply(msg,ip)
    // send a reply
    file.get('advertise','network-settings',(data) => {
        if (data === 'true' || data === 'false') {
            var advertise = data
        } else {
            var advertise = 'true'
        }
        var reply = {
            "header": {
                "type": "pg"
            },
            "body": {
                "advertise": advertise
            }
        }
        callback(reply)
    })
}
```

I also had to change the server so that it adds the header attributes onto the message, like the time and the size.

```javascript
var server = net.createServer((socket) => {
    var ip = socket.remoteAddress
    socket.setEncoding('utf8')
    // when it receives data, send to parseMsg()
    socket.on('data',(data) => {
        console.log('Received connection from: '+ip)
        console.log('Server received: '+data)
        parseMsg(data,ip,(msg) => {
            if (msg.header.type !== 'tx' && msg.header.type !== 'bk') {
                msg.body['time'] = Date.now()
                msg.header['version'] = version
                msg.header['size'] = Buffer.byteLength(JSON.stringify(msg.body))
                msg.header['hash'] = hash.sha256hex(JSON.stringify(msg.body))
            }
            var reply = JSON.stringify(msg)
            console.info('Sending message to '+ip+': '+reply)
            socket.write(reply)
            file.append('sent',msg.header.hash)
            socket.end()
        })
    })
})
```

##### `tx()`

Much like `pg()`, we will be reusing the code to verify transactions, so I split it up into a separate function. This way, it can be used across the program and not just in this context.

###### `transaction()`

`transaction()` will take in a message's body, then iterate through the inputs to see if they are valid, using `ecdsa.verifyMsg()`. The message is the amount plus the recipient's address plus the time. It is a subroutine and does not return anything.

```javascript
function transaction(tx) {
    var from = tx.from
    var len = from.length
    var input
    var concat
    // goes through the transaction inputs
    // and checks that they're all valid
    for (var i; i < len; ++i) {
        input = from[i]
        // this is the "message" for the ecdsa function
        concat = input.amount+tx.to+tx.time
        ecdsa.verifyMsg(concat,input.signature,input.person,(result) => {
            if (result) {
                // it worked
            } else {
                throw 'signature'
            }
        })
    }
}
```

It also needs to check that the wallets aren't overspending. To do this, I used a function that will be created later, `blockchain.checkBalance()`. We simply pass it the amount and the wallet, and it will return `true` if the wallet has enough arbitrary units to complete the transaction. However, you could bypass this by using the same wallet twice in the same transaction. Therefore, it throws a `parse` error if a wallet is repeated by adding the wallets to a list and checking each wallet against the list.

```javascript
function transaction(tx) {
    var from = tx.from
    var len = from.length
    var input
    var concat
    var repeats = []
    // goes through the transaction inputs
    // and checks that they're all valid
    for (var i; i < len; ++i) {
        input = from[i]
        if (repeats.contains(input)) {
            // wallets in a transaction must be unique
            throw 'parse'
        }
        // this is the "message" for the ecdsa function
        concat = input.amount+tx.to+tx.time
        ecdsa.verifyMsg(concat,input.signature,input.person,(result) => {
            if (result) {
                blockchain.checkBalance(input.person,input.amount,(balanceCheck) => {
                    if (balanceCheck) {
                        repeats.push(input)
                    } else {
                        throw 'amount'
                    }
                })
            } else {
                throw 'signature'
            }
        })
    }
}
```

Now, all `tx()` need to do is call that subroutine, and then add it to `txpool.json`, send it on to all the other nodes, and add it to `txpool.json`, if it's not already there.

```javascript
function tx(msg,callback) {
    var reply = {
        "header": {
            "type": "ok"
        },
        "body": {}
    }
    // verify that it works
    transaction(msg.body)
    // add to txpool
    file.getAll('txpool',(data) => {
        var txpool = JSON.parse(data)
        if (!txpool.includes(msg.body)) {
            file.append('txpool',msg.body,() => {
                // send to contacts
                sendToAll(msg)
                // reply
                callback(reply)
            })
        }
    },'[]')
}
```

##### `bk()`

As with `tx()`, I made a separate subroutine to see if a block is valid. This iterates checks the difficulty of a block and then goes through the transactions, calling `transaction()` for each one. However, I ran into a major problem, in that I could not figure out how to verify the difficulty if it could change. At the moment, the system only lets blocks into `blockchain.json` if the block is valid. However, with dynamic difficulties, the block could be invalid (by having a difficulty that's too small) but still be in `blockchain.json` if we don't have it's parent on disk to verify that. This would lead to a lot of issues if the blocks in `blockchain.json` could not be trusted, and would require an extremely complex restructuring of the whole system, or would require running this subroutine on the whole blockchain every time a block is valid, which would be far too resource-intensive. I could not figure out how to solve this issue, so unfortunatly I had to instead set the difficulty to 6, permanantly. I set the difficulty as a `const` at the top of the program.

```javascript
function block(body) {
    const difficulty = 6
    var txlist = body.transactions
    var len = txlist.length
    var tx
    var blockhash = hash.sha256hex(JSON.stringify(body))
    // verify all the transactions
    var pass = true
    for (var i = 0; i < body.difficulty; i++) {
        if (blockhash.charAt(i) !== 'a') {
            pass = false
        }
    }
    if (body.difficulty === difficulty && pass) {
        for (var i; i < len; ++i) {
            tx = txlist[i]
            try {
                transaction(tx)
            } catch(e) {
                if (e === 'signature' || e === 'amount') {
                    throw 'transaction'
                }
            }
        }
    } else {
        throw 'difficulty'
    }
}
```

The `bk()` function itself is very simple, as it just calls `block()` then `blockchain.addBlock()`, a function that will be covered later.

```javascript
function bk(msg,callback) {
    var reply = {
        "header": {
            "type": "ok"
        },
        "body": {}
    }
    block(msg.body)
    // if nothing has been thrown, add to local blockchain
    blockchain.addBlock(msg)
    network.sendToAll(msg)
    callback(reply)
}
```

##### `hr()`

To construct a `bh`, we need to use a function that has not yet been covered, `blockchain.getTopBlock()`. This simply returns the hash of the top block of the blockchain.

```javascript
function hr(msg,callback) {
    file.getAll('blockchain',(data) => {
        if (data === null || data === "{}") {
            throw 'notfound'
        } else {
            blockchain.getTopBlock(JSON.parse(data),(top) => {
                var reply = {
                    "header": {
                        "type": "bh"
                    },
                    "body": {
                        "hash": top
                    }
                }
                callback(reply)
            })
        }
    })
}
```

##### `nr()`

For a node request, we simply iterate through connections, and add them to an array if `"advertise"` is `"true"`, the IP is not the same as the node that sent us this message, and if the number of connections is less than the number that was requested. We also need to make sure that if `msg.max` does not exist, we use `Infinity` instead since `i` will always be less than `Infinity`.

```javascript
function nr(msg,ip,callback) {
    var max = Infinity
    if (msg.hasOwnProperty('max')) {
        var max = msg.max
    }
    var nodes = []
    file.getAll('connections',(data) => {
        if (data === null) {
            throw 'notfound'
        }
        var connections = JSON.parse(data)
        connections.forEach((connection,i) => {
            if (connection.ip !== ip && i < max && connection.advertise === "true") {
                nodes.push(connections)
            }
        })
        var reply = {
            "header": {
                "type": "nd"
            },
            "body": {
                "nodes": nodes
            }
        }
        callback(reply)
    })
}
```

##### `cr()`

When a client receives a chain request, there are three possibilites:

1. It asks for a hash, which it has
2. It asks for a hash, which it doesn't have
3. It does not ask for a hash

If it asks for a hash and the client does not have that hash, or if the requested hash is not a part of a complete chain, then it should throw a `"notfound"` error. If it asks for a specific hash and it has that hash, then the client will call `blockchain.getChain()` to get the desired chain.

If no hash is requested, then it uses `blockchain.mainChain()` to get the tallest chain.

```javascript
function cr(msg,callback) {
    if (msg.body.hasOwnProperty('hash')) {
        blockchain.get(msg.body.hash,(block) => {
            if (block === null) {
                throw 'notfound'
            } else {
                blockchain.getChain(msg.body.hash,(chain) => {
                    if (chain === null) {
                        throw 'notfound'
                    } else {
                        var reply = {
                            "header": {
                                "type": "cn"
                            },
                            "body": {
                                "chain": chain
                            }
                        }
                        callback(reply)
                    }
                })
            }
        })
    } else {
        blockchain.mainChain((chain) => {
            var reply = {
                "header": {
                    "type": "cn"
                },
                "body": {
                    "chain": chain
                }
            }
            callback(reply)
        })
    }
}
```

#### Sending Messages

We now need to update the `sendMsg()` function, so that it automatically adds the time, the version number, the hash and the size to the header and body. It also needs to check that the message has not already been sent by checking the hash against `sent.json`.

I also had an unexplained bug where it would fail to parse `sent.json`, so line 6-8 detects and fixes that, as I was not able to find a proper fix.

```javascript
function sendMsg(msg,ip,callback) {
    // for checking that the message hasn't already been sent
    file.getAll('sent',(data) => {
        // for some reason, sent.json sometimes ends with [...]]
        // until I find the source of the bug, this will do
        if (data[data.length-1] === data[data.length-2]) {
            data = data.slice(0,-1)
        }
        var sent = JSON.parse(data)
        if (msg.header.type !== 'bk' && msg.header.type !== 'tx') {
            // don't want to affect the body of a block
            // and the time of the tx is crucial as well
            // as it will throw off the hash
            msg.body['time'] = Date.now()
        }
        msg.header['version'] = version
        msg.header['size'] = Buffer.byteLength(JSON.stringify(msg.body))
        msg.header['hash'] = hash.sha256hex(JSON.stringify(msg.body))

        // check that the message hasn't already been sent
        if (!sent.includes(msg.header.hash)) {
            var sendMe = JSON.stringify(msg)
            console.info('Sending message to '+ip+': '+sendMe)

            // actually go send the message
            var client = new net.Socket()
            client.connect(port,ip,() => {
                client.write(sendMe)
                // add the hash to the sent messages file
                file.append('sent',msg.header.hash)
                client.on('data',(data) => {
                    console.log('Client received: '+data)
                    parseReply(data,ip,() => {
                        client.destroy()
                    })
                })
                client.on('close',() => {
                })
                client.on('timeout',() => {
                    console.warn('Client timed out')
                    client.destroy()
                })
                client.on('error',(e) => {
                    console.warn('Client timed out')
                    client.destroy()
                })
            })
        } else {
            console.log('Message already sent')
        }
    },'[]')
}
```

I also created a function called `sendToAll()`, which I have used previously. Unsuprisingly, it reads `connections.json` and sends a message using `sendMsg()` to each of the nodes.

```javascript
function sendToAll(msg) {
    file.getAll('connections',(data) => {
        // doesn't do anything if there's no connections
        if (data !== null || data === '' || data === '[]') {
            nodes = JSON.parse(data)
            // go through connections and send a message to each
            nodes.forEach((node) => {
                sendMsg(msg,node.ip)
            })
        }
    })
}
```

#### Parsing replies

Now we need to make the equivalent function to `parseMsg()` for replies, which is `parseReply()`. It is nearly identical except it doesn't send a reply back, so is simpler. All it does in the case of error is save the message to `error-log.json`.

```javascript
function parseReply(data,ip,callback=()=>{}) {
    // parse incoming replies
    // by calling parse functions
    try {
        var msg = JSON.parse(data)
        if (msg.header.hash == hash.sha256hex(JSON.stringify(msg.body))) {
            if (msg.header.type === 'cn') {
                // chain
                parse.cn(msg)
            } else if (msg.header.type === 'bh') {
                // top hash
                parse.bh(msg)
            } else if (msg.header.type === 'nd') {
                // nodes
                parse.nd(msg)
            } else if (msg.header.type === 'pg') {
                // ping
                parse.pgreply(msg,ip)
            } else if (msg.header.type === 'ok') {
                // message received ok
                console.info('message recieved ok')
            } else if (msg.header.type === 'er') {
                // error (uh oh)
                console.warn('We recieved an error')
                parse.er(msg)
            } else {
                throw 'type'
            }

        } else {
            throw 'hash'
        }
    } catch(e) {
        console.warn('Reply error: '+e)
        file.append('error-log',msg)
    } finally {
        // call the callback, if needed
        callback()
    }
}
```

#### Parsing different reply types

Now we need to make the parsing functions for the replies, in `parse.js`. I have already covered `parse.pgreply()` in the previous section.

##### `cn()`

In theory, we should just be able to iterate through the nodes and add them one by one. However, an oversight in the `blockchain.addBlock()` function means that it takes in full messages rather than just the body. I worked around this by putting each block into an object as the `"body"`, like so:

```javascript
function cn(msg) {
    for (var key in msg.chain) {
        // an oversight means we need to give it msg.body
        var block = {"body":msg.chain[key]}
        blockchain.addBlock(block)
    }
}
```

##### `nd()`

When we receive these nodes, we need to make sure that we are not pinging nodes that we are already connected to. This means that we need to get the list of nodes and only send `pg` messages to those that aren't on both lists.

The first part of this function is simply constructing the `pg` message.

```javascript
function nd(msg) {
    // some nodes we can connect to
    file.get('advertise','network-settings',(data) => {
        if (data === 'true' || data === 'false') {
            var advertise = data
        } else {
            var advertise = 'true'
        }
        var ping = {
            "header": {
                "type": "pg"
            },
            "body": {
                "advertise": advertise
            }
        }
        file.getAll('connections',(data) => {
            // this must get connection data, as otherwise it wouldn't have received this message
            var connections = JSON.parse(data)
            msg.body.nodes.forEach((node) => {
                var send = true
                // if we are already connected to the node don't send
                connections.forEach((connection) => {
                    if (node.ip === connection) {
                        send = false
                    }
                })
                // otherwise send a ping
                if (send) {
                    network.sendMsg(ping,node.ip)
                }
            })
        })
    })
}
```

##### `bh()`

This is the reply to a hash request, and is the hash of that client's top block. In this function, we need to check if it's in the blockchain, and if not, send out chain requests. To do this, we use `!Object.keys(mainchain).includes(msg.body.hash)`, which gets all the keys from a block and checks to see if `msg.body.hash` is one of them. If it does, it returns `!true`, which is `false`.

```javascript
function bh(msg,callback) {
    file.getAll('blockchain',(data) => {
        var mainchain = JSON.parse(data)
        if (!Object.keys(mainchain).includes(msg.body.hash)) {
            // if the received top hash is not equal to the one on disk
            // and it's not in the blockchain, then send out a chain request
            var chainrequest = {
                "header": {
                    "type": "cr"
                },
                "body": {
                    "hash": msg.body.hash
                }
            }
            network.sendToAll(chainrequest)
        }
    },'{}')
}
```

##### `ok()`

I didn't even make an `ok()` function, I just had it print `"Message received ok"` into the console back in `parseReply()`.

##### `er()`

All we need to do here is append the message to `error-logs.json`.

```javascript
function er(msg) {
    file.append('error-logs',msg)
}
```

#### Exporting functions

Finally, I exported the functions.

```javascript
exports.tx = tx
exports.bk = bk
exports.hr = hr
exports.nr = nr
exports.pg = pg
exports.pgreply = pgreply
exports.nd = nd
exports.bh = bh
exports.cr = cr
exports.er = er
exports.cn = cn
exports.block = block
exports.transaction = transaction
```

### Blockchain

We now need to tackle the blockchain, which is a critical part of the project. It it basically a cool name for a linked list. We need to create the following functions to process it:

- Getting a block
- Check how many au a wallet has
- Adding a block
- Getting the top block in the chain
- Getting all the blocks between the top block and the genesis block

To aid with the first function, I decided to structure the blockchain as an object literal rather than an array, with the hash of the block as the key. In this way, we don't need to store the header, and to get a block we simply use `blockchain[hash_of_block]`.

I creates all these functions in a file called `blockchain.js`. The blockchain itself is stored in `blockchain.json`, in `%APPDATA%`. First of all, I created `getBlock()`.

#### `getBlock()`

This simply uses `file.get()` to get the block

```javascript
const file = require('./file.js')

function getBlock(hash,callback) {
    file.get(hash,'blockchain',callback)
}
```

#### Balances

Since we don't want to have to trawl through the blockchain to check every input of every transaction, I decided to store just the balances in a new file called `balances.json`. This file is again a dictionary-style object, with the wallet as the key storing the amount assigned to them. This is much more efficient for getting the amount assigned to a block. We will only need to generate this file when the blockchain changes. To generate it, I created a function called `calcBalances()`

##### `calcBalances()`

`calcBalances()` needs to iterate through all the inputs in each transaction in each block in the blockchain. I decided to use `forEach()` to do this, as although it is technically slower, it is much clearer to see what is happening. In each input, it sees if `balances`, the object that stores the balances, contains the wallet referred to in the input, using `hasOwnProperty()` which returns `true` if the property has a value assigned to it. If that's case, it deducts the amount defined in the input, and increases the recipient's balance by the same amount.

```javascript
function calcBalances() {
    file.getAll((data) => {
        var chain = JSON.parse(data)
        var balances = {}
        // iterate through the blocks
        for (var key in chain) {
            var block = chain[key]
            transactions = block.transactions
            // iterate through each block to find each transaction
            transactions.forEach((transaction) => {
                // iterate through the inputs
                transaction.from.forEach((from) => {
                    // deduct amounts from the inputs
                    if (balances.hasOwnProperty(from.wallet)) {
                        balances[from.wallet] -= from.amount
                    } else {
                        balances[from.wallet] = -from.amount
                    }
                    // add amount to the recipient's balance
                    if (balances.hasOwnProperty(transaction.to)) {
                        balances[transaction.to] += from.amount
                    } else {
                        balances[transaction.to] = from.amount
                    }
                })
            })
        }
        file.storeAll('balances',balances)
    })
}
```

However, we also need to accound for the mining reward. I set this as a `const` at the top of the function. Since it is in microau, it is set to 50000000. For each block, we add the mining reward to the miner's wallet.

```javascript
function calcBalances() {
    const miningreward = 50000000
    file.getAll((data) => {
        var chain = JSON.parse(data)
        var balances = {}
        // iterate through the blocks
        for (var key in chain) {
            var block = chain[key]
            transactions = block.transactions
            // iterate through each block to find each transaction
            transactions.forEach((transaction) => {
                // iterate through the inputs
                transaction.from.forEach((from) => {
                    // deduct amounts from the inputs
                    if (balances.hasOwnProperty(from.wallet)) {
                        balances[from.wallet] -= from.amount
                    } else {
                        balances[from.wallet] = -from.amount
                    }
                    // add amount to the recipient's balance
                    if (balances.hasOwnProperty(transaction.to)) {
                        balances[transaction.to] += from.amount
                    } else {
                        balances[transaction.to] = from.amount
                    }
                })
            })
            // mining rewards
            if (balances.hasOwnProperty(block.miner)) {
                balances[block.miner] += miningreward
            } else {
                balances[block.miner] = miningreward
            }
        }
        file.storeAll('balances',balances)
    })
}
```

However, we have a problem. In it's current state, it calculates the balance of *every* block rather than those under the top block, which is incorrect. What we need is a function which gets the top block then returns a subsection of the blockchain containing only blocks under the top block. This function will be called `mainChain()`, and will be defined later. For now, we will pretend that it exists (as I made these functions at the same time).

```javascript
function calcBalances() {
    const miningreward = 50000000
    // mainChain gets the longest chain, as only the blocks under the highest
    // actually count
    mainChain((chain) => {
        var balances = {}
        // iterate through the blocks
        for (var key in chain) {
            var block = chain[key]
            transactions = block.transactions
            // iterate through each block to find each transaction
            transactions.forEach((transaction) => {
                // iterate through the inputs
                transaction.from.forEach((from) => {
                    // deduct amounts from the inputs
                    if (balances.hasOwnProperty(from.wallet)) {
                        balances[from.wallet] -= from.amount
                    } else {
                        balances[from.wallet] = -from.amount
                    }
                    // add amount to the recipient's balance
                    if (balances.hasOwnProperty(transaction.to)) {
                        balances[transaction.to] += from.amount
                    } else {
                        balances[transaction.to] = from.amount
                    }
                })
            })
            // mining rewards
            if (balances.hasOwnProperty(block.miner)) {
                balances[block.miner] += miningreward
            } else {
                balances[block.miner] = miningreward
            }
        }
        file.storeAll('balances',balances)
    })
}
```

##### `getTopBlock()`

To get the main chain, we need to know what the top block is. Initally, I iterated through them and based it off of `height`, using `time` as a tie-break. To make it more flexible, I made it so you have to pass the blockchain to the function to avoid repeating reading the file.

```javascript
function getTopBlock(fullchain,callback) {
    // get the first key in the object
    // doesn't matter if it's best it just needs to be valid
    for (var best in fullchain) {
        // this is the fastest way of getting the first key
        // even if it's kind of messy looking
        // Object.keys(fullchain)[0] puts the whole object into memory
        break
    }
    if (typeof best !== 'undefined') {
        // iterates through the fullchain
        for (var key in fullchain) {
            // larger height the better
            if (fullchain[key].height > fullchain[best].height) {
                best = key
            }
            // otherwise, if they're the same pick the oldest one
            } else if (fullchain[key].height === fullchain[best].height) {
                if (fullchain[key].time < fullchain[best].time) {
                        best = key
                    }
                }
            }
        }
    } else {
        best = null
    }
    callback(best)
}
```

However, someone could submit a phoney block that has a really high height, without actually being connected to the genesis block through the chain. Whilst it is not the most efficient solution, I decided to only consider a block as the `best` if I could iterate down to the genesis block, which has `parent` of `'0000000000000000000000000000000000000000000000000000000000000000'`. I also made it start with the genesis block.

```javascript
function getTopBlock(fullchain,callback) {
    const genesis = '0000000000000000000000000000000000000000000000000000000000000000'
    // get the origin block
    // as there is nothing under it to be wrong
    for (var best in fullchain) {
        if (fullchain[best].parent === genesis) {
            break
        }
    }
    if (typeof best !== 'undefined' && fullchain[best].parent === genesis) {
        // iterates through the fullchain
        for (var key in fullchain) {
            // larger height the better
            if (fullchain[key].height > fullchain[best].height) {
                var candidate = true
                // iterate down the chain to see if you can reach the bottom
                // if the parent is undefined at any point it is not part of the main chain
                // run out of time for a more efficient method
                var current = key
                var parent
                while (fullchain[current].parent !== genesis) {
                    parent = fullchain[current].parent
                    if (typeof fullchain[parent] !== 'undefined') {
                        current = parent
                    } else {
                        candiate = false
                    }
                }
                if (candidate) {
                    best = key
                }
            // otherwise, if they're the same pick the oldest one
            } else if (fullchain[key].height === fullchain[best].height) {
                if (fullchain[key].time < fullchain[best].time) {
                    // see other comments
                    var candidate = true
                    var current = key
                    while (fullchain[current].parent !== genesis) {
                        parent = fullchain[current].parent
                        if (typeof fullchain[parent] !== 'undefined') {
                            current = parent
                        } else {
                            candiate = false
                        }
                    }
                    if (candidate) {
                        best = key
                    }
                }
            }
            document.getElementById('height').textContent = fullchain[best].height
        }
    } else {
        best = null
    }
    callback(best)
}
```

##### `mainChain()`

`mainChain()` pretty much repeats what `getTopBlock()` does to verify that a block is a part of the chain, except it stores the blocks that it finds, to create a subsection of the chain. Only this part of the chain is valid, which is why it is so important.

```javascript
function mainChain(callback) {
    var mainchain = {}
    file.getAll('blockchain',(data) => {
        if (data === '{}') {
            callback({})
        } else {
            var fullchain = JSON.parse(data)
            getTopBlock(fullchain,(top) => {
                mainchain[top] = fullchain[top]
                var current = top
                var parent
                while (fullchain[current].parent !== '0000000000000000000000000000000000000000000000000000000000000000') {
                    parent = fullchain[current].parent
                    mainchain[parent] = fullchain[parent]
                    current = parent
                }
                callback(mainchain)
            })
        }
    },'{}')
}
```

##### `getChain()`

`getChain()` gets a specific part of the chain under a hash passed to it as a parameter, rather than the one given by `getTopBlock()`. Other than that, it is very similar to `mainChain()`, other than it has more error handling since it is unknown if the requested chain actually reaches the bottom, unlike in `mainChain()`.

```javascript
function getChain(top,callback) {
    var mainchain = {}
    file.getAll('blockchain',(data) => {
        if (data === '{}') {
            callback(null)
        } else {
            try {
                var fullchain = JSON.parse(data)
                mainchain[top] = fullchain[top]
                var current = top
                var parent
                while (fullchain[current].parent !== '0000000000000000000000000000000000000000000000000000000000000000') {
                    parent = fullchain[current].parent
                    mainchain[parent] = fullchain[parent]
                    current = parent
                }
            } catch(e) {
                console.warn(e)
                mainchain = null
            } finally {
                callback(mainchain)
            }
        }
    },'{}')
}
```

##### `checkBalance()`

We need a function which checks the balance of a wallet to see if it greater than or equal to some amount. This function is called `checkBalance()`.

```javascript
function checkBalance(key,amount,callback) {
    file.get(key,'balances',(balance) => {
        // returns true if the wallet's balance is
        // less than or equal to the amount requested
        callback(balance >= amount)
    },0)
}
```

#### `addBlock()`

The `addBlock()` function is fairly simple, as all it needs to do is check if it's valid, append the block to `blockchain.json` and then call `calcBalances()`. However, we also need to remove any transactions from `txpool` that are in the block. To do this, we iterate through the transactions listed in the block and use `splice()` and `indexOf()` to remove the transaction from `txpool`, if it is there.

We then store `txpool`.

```javascript
function addBlock(msg) {
    try {
        parse.block(msg.body)
        // if it failed the test, an error will have been thrown
        file.store(hash.sha256hex(JSON.stringify(msg.body)),msg.body,'blockchain')
        console.log('Block added')
        file.getAll('txpool',(data) => {
            var txpool = JSON.parse(data)
            msg.body.transactions.forEach((tx) => {
                // remove pending transactions if they're in the received block
                txpool.splice(txpool.indexOf(tx),1)
            })
            file.storeAll('txpool',txpool)
            calcBalances()
        },'[]')
    } catch(e) {
        console.warn('Block failed:',JSON.stringify(msg))
        console.warn(e)
    }
}
```

`parse.block()` is used to make sure that it's valid, and will throw an error if it's not - this is why there is a `try...catch` statment.

Finally, I exported all the functions.

```javascript
exports.get = getBlock
exports.checkBalance = checkBalance
exports.calcBalances = calcBalances
exports.updateBalances = updateBalances
exports.addBlock = addBlock
exports.getTopBlock = getTopBlock
exports.mainChain = mainChain
```

### Pages

Before we start creating the pages, I decided to restructure the application slightly. I moved all the Javascript files relating to any of the pages - `overview.js`, `wallets.js` etc - to a subfolder in `js`, `pages`. I also moved the `changePage()` function from `renderer.js` to it's own file, then imported it back into `renderer.js`. I also modified it to account for the new location of the Javascript files.

```javascript
const remote = require('electron').remote
const fs = require('fs')

function changePage(name) {
    var path = 'pages/' + name + '.html'
    fs.readFile(path,'utf-8',(err, data) => {
        if (err) {
            alert('An error ocurred reading the file: '+name)
            console.warn('An error ocurred reading the file: '+err.message)
            return
        }
        document.getElementById('body').innerHTML = data
        try {
            const pageJS = require('./pages/'+name+'.js')
            pageJS.init()
        } catch(e) {
            console.error(e)
        }
    })
}

exports.changePage = changePage
```

I imported it back into `renderer.js` like so:

```javascript
const changePage = require('./js/changepage.js').changePage
```

Now that the Javascript files for pages are a folder deeper than the other files, we have to import these other files like so:

```javascript
const file = require('../file.js')
```

#### Transactions

##### Wallets

The Wallets page will contain a list of all the wallets that the user has stored. The user can interact with each one. The options they will have will be:

- Create transaction from wallet
- View private key
- Copy key

First, we need to store the wallets. Each wallet has four attributes:

- User-defined name
- Public key
- Private key
- Amount

The first three are static. However, the money in the wallet is dependent on the blockchain, which we do not want to have to trawl through every time to find the value of each wallet. Therefore, I decided to update the wallets every time `calcBalances()` is called. It iterates through `wallets.json`, which is where the wallets will be found, and finds the total amount for each wallet. While doing this, I realised that we could take this opportunity to calculate the balance counter in the corner of the application. For each wallet that is iterated through, the amount calculated for each wallets is added to a counter, and the total in the corner is set to this amount.

Finally, the new wallet's values are stored in `wallets.json`.

```javascript
function calcBalances() {
    const miningreward = 50000000
    // mainChain gets the longest chain, as only the blocks under the highest
    // actually count
    mainChain((chain) => {
        var balances = {}
        // iterate through the blocks
        // removed in this example as nothing has changed
        for (var key in chain) {...}
        // calculating the balance in the corner
        file.getAll('wallets',(data) => {
            var wallets = JSON.parse(data)
            var newWallets = []
            var balance = 0
            wallets.forEach((wallet) => {
                if (balances.hasOwnProperty(wallet.public)) {
                    amount = balances[wallet.public]
                } else {
                    amount = 0
                }
                // add the au in the wallet to the total balance
                balance += amount
                // and set the balance in the wallet
                newWallets.push({
                    "name": wallet.name,
                    "public": wallet.public,
                    "private": wallet.private,
                    "amount": amount
                })
            })
            // change microau to au and set the textcontent of the top left thing
            document.getElementById('current-balance').textContent = balance / 1000000
            // save balances
            file.storeAll('wallets',newWallets)
            file.storeAll('balances',balances)
        },'[]')
    })
}
```

Finally, we can start displaying the wallets in `wallets.html`. The HTML structure of the page is like so:

```html
<h1>Transactions</h1>

<h2>Wallets</h2>

<div class="highlight-box">
    <h3>My wallets</h3>
    <button id="create">Create new wallet</button>
    <div class="list" id="wallet-list"></div>
</div>
```

The button with an id of `create` needs to link to the page where wallets are generated, so we will need to import `changePage()` into `wallets.js`. `#wallet-list` is the html object where we will be adding the wallets. `.list` is a CSS class like so:

```css
.list {
    overflow-y: auto;
    overflow-x: hidden;
}
```

This means that if the contents of `#wallet-list` is too wide it will simply be hidden, but if it too tall it will create a scroll bar.

Elements within `.list` will have class `.list-item`, which has the following properties:

```css
.list-item {
    overflow-x: auto;
    width: calc(100% - 12px);
    background-color: white;
    margin: 5px 0;
    padding: 5px;
    border: 1px solid #333;
    border-radius: 5px;
    white-space: nowrap;
}
```

In `wallets.js`, we first import `file` and `changePage()`, and add an event listener to change the page to `wallets-create` when the button is clicked. This will be the page where we can create a wallet.

```javascript
const file = require('../file.js')
const changePage = require('../changepage').changePage

function init() {
    document.getElementById('create').addEventListener('click',() => {
        changePage('wallets-create')
    })
}

exports.init = init
```

We now need to populate `#wallet-list`. This is done by getting the wallets and iterating through them, appending a new `div` for each wallet, which is done by calling `document.createElement()` and using `appendChild()` to place it inside of the `#wallet-list` element. I also called `blockchain.calcBalances()` to ensure the wallets are up to date.

```javascript
const file = require('../file.js')
const changePage = require('../changepage').changePage
const blockchain = require('../blockchain.js')

function init() {
    document.getElementById('create').addEventListener('click',() => {
        changePage('wallets-create')
    })
    blockchain.calcBalances()
    file.getAll('wallets',(data) => {
        wallets = JSON.parse(data)
        var walletList = document.getElementById('wallet-list')
        var listItem
        wallets.forEach((wallet) => {
            listItem = document.createElement('div')
            walletList.appendChild(listItem)
        })
    },'[]')
}

exports.init = init
```

We now need to add the class `.list-item` to the child element, and add the data. The first is achieved by calling `listItem.classList.add('list-item')`. The second part however, using the method above of creating new elements using Javascript and appending them one by one, is cumbersome with the large number of sub-elements we need. Therefore, I decided instead to create a string and use `innerHTML`, which takes a string instead.

```javascript
wallets.forEach((wallet) => {
    listItem = document.createElement('div')
    listItem.classList.add('list-item')
    listItem.innerHTML = '<p><b>Name:</b> '+wallet.name+'</p><p><b>Public:</b> '+wallet.public+'</p><p><b>Amount:</b> <span class="money">'+wallet.amount/1000000+'</span></p>'
    walletList.appendChild(listItem)
})
```

Notice how `wallet.amount` is divided by 1000000 - this is because `wallet.amount` is in $\mu$au, and we need to convert it to au.

Now, to see if it works, we need to make a way to create wallets.

##### Creating Wallets

I created a new page called `create-wallets`, which was linked to earlier. The HTML for `create-wallets` is like so:

```html
<h1>Transactions</h1>

<h2>Create a Wallet</h2>

<p>Wallet Name:</p>
<input type="text"  id="name" placeholder="My Wallet"><br>
<p>Public Key:</p>
<div class="list-item" id="public"></div>
<p>Private Key (DO NOT SHARE!):</p>
<div class="list-item" id="private"></div>
<button id="create">Create Wallet</button>
```

It turns out we can reuse the `.list-item` class as a kind of highlight box. What `wallets-create.js` will need to do is populate `#public` and `#private` with the appropriate key, then add these and the name to a wallet when `#create` is clicked.

To do this, we need to use the `ecdsa` module, as well as `file` and `changePage`. This is where we can use `ecdsa.createKeys()` to create the public and private keys.

```javascript
const ecdsa = require('../ecdsa.js')
const changePage = require('../changepage').changePage
const file = require('../file.js')

function init() {
    ecdsa.createKeys((public, private, err) => {
        if (err) {
            console.error(err)
            changePage('wallets')
        } else {
            document.getElementById('public').innerText = public
            document.getElementById('private').innerText = private
        }
    })
    document.getElementById('create').addEventListener('click',() => {
        var name = document.getElementById('name').value
        console.log('Creating wallet: '+name)
        var data = {}
        data['name'] = name
        data['public'] = document.getElementById('public').textContent
        data['private'] = document.getElementById('private').textContent
        data['amount'] = 0
        console.log(JSON.stringify(data))
        file.append('wallets',data,() => {
            changePage('wallets')
        })
    })
}

exports.init = init
```

###### Testing

We can now test both `wallets` and `wallets-create`. First, I navigated to `wallets`.

![Wallets page](https://i.imgur.com/cJGwxw0.png)

As you can see, there's nothing there. So, I clicked on the "create" button, which takes us to `wallets-create`.

![wallets-create page](https://i.imgur.com/14WSrWD.png)

I entered the name "My Wallet" and pressed "Create", which took me back to the `wallets` page - except now, it had a wallet called "My Wallet", which means that it worked!

![Wallets with a wallet in it](https://i.imgur.com/UMolFuM.png)

##### Create Transaction

To create transactions, we need to be able to add in multiple input sources. This is much more complex than a single dropdown, as since the input sources will need to be added through Javascript, they can't (easily) have unique ids.

First of all, I created the HTML for the page, in `make.html`. `#error` has class `.hidden`, which gives it property `display: none`. When we want to display the error message, we remove this class.

Notice how the `#inputs` div is empty. This is because we will add the dropdowns with in through Javascript.

```html
<h1>Transactions</h1>

<h2>Make Transactions</h2>

<div class="hidden" id="error">
    <p><b>Error:</b> missing/incorrect form values</p>
</div>

<form>
    <p>To:</p>
    <input type="text" id="to" placeholder="Address"><br>
    <p>From:</p>
    <div id="inputs">
    </div>
    <button type="button" id="addInput">Add input</button>
    <p>Please note that each wallet can only be used once</p>
    <button type="button" id="send">Send</button>
</form>
```

Now, we need to create `make.js`. In the `init()` function, all we do is add event listeners to the buttons. We also import all the necessary functions.

```javascript
const file = require('../file.js')
const parse = require('../parse.js')
const ecdsa = require('../ecdsa.js')
const network = require('../network.js')

function init() {
    var add = document.getElementById('addInput')
    var send = document.getElementById('send')
    add.addEventListener('click',addInput)
    send.addEventListener('click',sendTx)
}

exports.init = init
```

Now we need to create the function `addInput()`, which is called when the `#addInput` button is pressed. It creates a div with the class `.input-group`. It then adds a dropdown, a line break, and a number input box to that div, and adds a placeholder value to the dropdown. It then appends `.input-group` to `#inputs`.

```javascript
function addInput() {
    var inputGroup = document.createElement('div')
    inputGroup.classList.add('input-group')
    // add select
    // <select name="dropdown"></select>
    var select = document.createElement('select')
    select.name = 'dropdown'
    // add placeholder
    select.innerHTML = '<option value="" selected disabled>Choose a wallet</option>'
    // add br
    // <br>
    var br = document.createElement('br')
    // add number input
    // <input name="amount" type="number" placeholder="Amount to send">
    var number = document.createElement('input')
    number.type = 'number'
    number.placeholder = 'Amount to send'
    number.name = 'amount'
    // add them all to the page
    inputGroup.appendChild(select)
    inputGroup.appendChild(br)
    inputGroup.appendChild(number)
    document.getElementById('inputs').appendChild(inputGroup)
}
```

However, we need to put the wallets in the dropdown. For this, I created a new function called `populateDropdown()`, which opens `wallets.json` and adds `option` elements to the dropdown with the wallets' name and balance. It also sets the `value` of the option to the public key, which is important, as this is what will be returned when we get the `value` of the dropdown if that option is selected. I also called the function in line 10 of the above snippet.

```javascript
function populateDropdown(select) {
    var option
    // get list of wallets
    file.getAll('wallets',(data) => {
        var wallets = JSON.parse(data)
        wallets.forEach((wallet) => {
            option = document.createElement('option')
            option.value = wallet.public
            option.text = wallet.amount/1000000+"au - "+wallet.name
            select.add(option)
        })
    })
}
```

Finally, I called `addInput()` in the `init()` function so that the page starts with an input. You can see that this all worked:

![make tx](https://i.imgur.com/bVVNjfW.png)

Now, we just need to add the `sendTx()` function. The reason I had structured the inputs in this way is that I knew that `document.getElementsByClassName()` gives an array of the elements with that class name. Therefore, we can get all the elements with class name `.input-group` and iterate through them. We can then use `childNodes` to get the children of each group, then get their values.

```javascript
function sendTx() {
    var to = document.getElementById('to').value
    var groups = document.getElementsByClassName('input-group')
    groups.forEach((group) => {
        var child = group.childNodes
        var wallet = child[0].value
        var amount = child[1].value
        console.log(wallet)
        console.log(amount)
    })
}
```

However, there are some issues with this - first and foremost, `document.getElementsByClassName()` does not return an array - it returns a `HTMLCollection`, which is similar but we can't iterate through it. Luckily, this is easy to solve by turning it into an array using `Array.from`.

Secondly, there are actually three elements within each group, and therefore `child[1]` returns the `br` rather than the `input` that we want. This is fixed by using `child[2]` instead.

```javascript
function sendTx() {
    var to = document.getElementById('to').value
    // this isn't an array for some reason
    // we can make it one using Array.from
    // https://stackoverflow.com/a/37941811/5453419
    var groups = Array.from(document.getElementsByClassName('input-group'))

    groups.forEach((group) => {
        var child = group.childNodes
        var wallet = child[0].value
        console.log(wallet)
        // 2 because of the br
        var amount = child[2].value
        console.log(amount)
    })
}
```

Now we need to get data from `wallets.json` in order to sign the inputs. However, since `wallets.json` is an array, we can't easily get the private key with the public key, so I decided instead to put the wallets in a new format so you can get the private key from the secret key.

```javascript
function sendTx() {
    var to = document.getElementById('to').value
    // this isn't an array for some reason
    // we can make it one using Array.from
    // https://stackoverflow.com/a/37941811/5453419
    var groups = Array.from(document.getElementsByClassName('input-group'))
    var message = {
        "header": {
            "type": "tx"
        },
        "body": {
            "to": to,
            "from": []
        }
    }
    file.getAll('wallets',(data) => {
        var time = Date.now()
        message.body['time'] = time
        // converting wallets into a format
        // where you can enter the public key
        // and get the private key
        var convert =  {}
        var wallets = JSON.parse(data)
        wallets.forEach((wallet) => {
            public = wallet.public
            private = wallet.private
            convert[public] = private
        })
        groups.forEach((group) => {
            var child = group.childNodes
            var wallet = child[0].value
            console.log(wallet)
            // 2 because of the br
            var amount = child[2].value
            console.log(amount)
        })
    })
}
```

Now we can call `convert[public]` to get the private key. Next we need to create the signatures etc, which is fairly easy, since we have already created the `signMsg()` function. However, I put it all in a `try-catch` statement, and if an error is caught it removes `.hidden` from `#error`.

If the message manages to reach the end without errors, it checks the message using `parse.transaction`, sends the message using `sendToAll()` and finally appends the message body to both `txpool.json` and `recenttx.json`, for mining and for view transaction history, respectively.

```javascript
function sendTx() {
    var to = document.getElementById('to').value
    // this isn't an array for some reason
    // we can make it one using Array.from
    // https://stackoverflow.com/a/37941811/5453419
    var groups = Array.from(document.getElementsByClassName('input-group'))
    var message = {
        "header": {
            "type": "tx"
        },
        "body": {
            "to": to,
            "from": []
        }
    }
    file.getAll('wallets',(data) => {
        var time = Date.now()
        message.body['time'] = time
        // converting wallets into a format
        // where you can enter the public key
        // and get the private key
        var convert =  {}
        var wallets = JSON.parse(data)
        wallets.forEach((wallet) => {
            public = wallet.public
            private = wallet.private
            convert[public] = private
        })
        try {
            groups.forEach((group) => {
                var child = group.childNodes
                var wallet = child[0].value
                console.log(wallet)
                // 2 because of the br
                var amount = child[2].value
                console.log(amount)
                if (wallet && amount > 0) {
                    // convert to microau
                    amount *= 1000000
                    // the message that is signed
                    var concat = amount+to+time
                    var signature = ecdsa.signMsg(concat,convert[wallet],(signature) => {
                        message.body.from.push({
                            "wallet": wallet,
                            "amount": amount,
                            "signature": signature
                        })
                    })
                } else {
                    throw 'no amount entered'
                }
            })
            // if it's invalid, it will throw an error and be caught by the try-catch
            console.log('Transaction: '+JSON.stringify(message))
            parse.transaction(message.body)
            network.sendToAll(message)
            file.append('txpool',message.body)
            file.append('recenttx',message.body)
        } catch(e) {
            document.getElementById('error').classList.remove('hidden')
            console.warn('Tx failed: '+e)
        }
    },'[]')
}
```

This can only really be tested when everything else works, so this will be covered in the full testing phase.

##### View recent

This section is very similar to the wallet viewing page, except it reads `recenttx.json` instead. The HTML, `history.html`, looks like this:

```html
<h1>Transactions</h1>

<h2>Transaction History</h2>

<div class="highlight-box">
    <h3>Recent Transactions</h3>
    <button id="create">Make transaction</button>
    <div class="list" id="tx-list"></div>
</div>
```

`history.js` looks like this:

```javascript
const file = require('../file.js')
const changePage = require('../changepage').changePage

function init() {
    document.getElementById('create').addEventListener('click', function () {
        changePage('make')
    })
    file.getAll('recenttx',(data) => {
        transactions = JSON.parse(data)
        var txList = document.getElementById('tx-list')
        var listItem
        if (transactions) {
            transactions.forEach((tx) => {
                var balance = 0
                tx.from.forEach((from) => {
                    balance += from.amount/1000000
                })
                listItem = document.createElement('div')
                listItem.classList.add('list-item')
                // timestamp to date
                var date = new Date(tx.time).toString()
                listItem.innerHTML = '<p><b>Time:</b> '+date+'</p><p><b>To:</b> '+tx.to+'</p><p><b>Amount:</b> <span class="money">'+balance+'</span></p>'
                txList.appendChild(listItem)
            })
        }
    })
}

exports.init = init
```

Something of note is the date - since `tx.time` is a timestamp, we need to turn it into something readable before printing it. For this, we use the `Date` class. Creating a `Date` object then using `toString()` turns it into a human-readable date. Initially, I tried to use `toISOString()`, which creates this:

```console
new Date(Date.now()).toISOString()
"2018-03-14T14:30:01.112Z"
```

However, that is not very readable. I soon discovered that I could use `toString() instead:

```console
new Date(Date.now()).toString()
"Wed Mar 14 2018 14:29:49 GMT+0000 (GMT Standard Time)"
```

That is much better, as it is clear what time and date that represents.

Again, since we need to be able to create transactions to see them here, and since we need the blockchain to work in order to do that, we will have to test this at the end.

#### Blockchain

The blockchain pages are a critical aspect of the project, as it is here where we mine the blockchain.

##### Mining

Mining the blockchain, as mentioned previously, consists of performing hundreds of thousands hash operations to find the one that passes a "difficulty test" - in this case, it passes if the hash begins with a certain number of hashes. Obviously, this is very CPU intensive, and since Node.js is single-threaded this would cripple the performance of the application. This is not desirable, so I looked for alternatives.

###### Multi-threading alternatives

The first option I looked at was to see if there was a multithreading module default to Node.js. This lead me to `child_process`. However, although this appeared to be relevent to my problems, it looked far too complex for this project.

Next, I looked to see if there was anything default to Javascript itself. As it turns out, there is a `Webworker` API which allows you to run a different JS file independantly from the main program, and also communicate between programs.

An example of a `Webworker`:

```javascript
var worker = new Worker('worker.js')

worker.onmessage = (msg) => {
    console.log(msg.data)
}
```

However, I immediately ran into a problem when I tried to use Node.js functions in the `worker.js` file.

```console
ReferenceError: require is not defined
```

Webworkers can only use plain Javascript, and don't have access to Node.js modules or features. This is a massive problem, as we need to use `cryto` module to find the hash of the block at a minimum. I therefore had to carry on looking.

The next place I looked was in `npm`. Since `Worker()` was exactly what I needed, I looked for Node.js-compatible alternative.

Luckily enough, I found one. `tiny-worker` replaces `Webworker` with the same API but now with access to Node.js functions.

```shell
>npm install --save tiny-worker
```

###### Mining page

The idea behind the mining page is that we have a `pre` element acting as a console, and then also have a button to toggle the miner.

```html
<h1>Blockchain</h1>

<h2>Mine for Arbitrary Units</h2>

<button id="toggle" style="margin-right:5px">Start</button><button id="clear">Clear</button> <b>Please note:</b> Mining is very CPU intensive

<pre id="console"></pre>
```

I also added a button to clear the console.

The console has the following CSS, to make sure that it is the right size, and has a monospace font.

```css
#console {
    box-sizing: border-box;
    width: 100%;
    height: calc(100% - 180px);
    min-height: 300px;
    background-color: #ececec;
    border-radius: 5px;
    border: 1px solid #333;
    padding: 5px;
    overflow-y: auto;
    overflow-x: hidden;
    font-family: 'Courier New', 'Courier', monospace;
}
```

Next I created `mine.js` in `/js/pages`.

```js
const Worker = require('tiny-worker')
const blockchain = require('../blockchain.js')
const network = require('../network.js')
const file = require('../file.js')

function init() {
    var miner = null
    var button = document.getElementById('toggle')
    var clear = document.getElementById('clear')
    var pre = document.getElementById('console')

    clear.addEventListener('click',() => {
        pre.innerHTML = ''
    })

    button.addEventListener('click',() => {
        if (button.textContent == 'Start') {
            pre.innerHTML += 'Start'
            button.textContent = 'Stop'
        } else {
            pre.innerHTML += 'Mining stopped<br>'
            button.textContent = 'Start'
        }
    })
}

exports.init = init
```

`init()` adds event listeners to `#toggle` and to `#clear`. `#clear` simply sets the content of `#console` to an empty string. For `#toggle`, I created an if statement that switches the text content of the button between `'Start'` and `'Stop'`. This way, we can do one thing when the button says "Start" and a different thing when it says "Stop".

The next stage is to create the `Worker`. If the button is set to "Start", then it checks to see if the miner exists already. If not, it creates a new instance of `Worker` and sets it to `miner`. It sets `miner`'s `onmessage` function to add any received data to `#console`. If the button is set to "Stop", then it sets `miner` to `null` and then adds "Mining stopped" to the `#console`. After both, it toggles the text content of the button.

```javascript
button.addEventListener('click',() => {
    if (button.textContent == 'Start') {
        if (miner === null) {
            try {
                miner = new Worker('js/mining-script.js')
                miner.onmessage = (msg) => {
                    pre.innerHTML += msg.data+'<br>'
                }
            } catch(e) {
                pre.innerHTML = 'Problem starting mining script, sorry :/'
            }
        }
        button.textContent = 'Stop'
    } else {
        if (miner !== null) {
            miner.terminate()
            miner = null
        }
        pre.innerHTML += 'Mining stopped<br>'
        button.textContent = 'Start'
    }
})
```

Next we need to create `mining-script.js`, in the `/js` folder. For the time being, I just made it post "Hello World" back to the main program.

```javascript
postMessage('Hello World')
```

Navigating to `mine` and clicking "Start" gives:

![Hello World](https://i.imgur.com/wQRhtad.png)

This shows that it works!

###### Mining Script

We now need to flesh out the mining script. Unfortunately, the following code is very messy, as errors generated in the mining script seemed to disappear or be printed in the command line rather than in the Chromium console, and as such took a great deal of trial and error to get working.

Because of this, I will simply put the final code here rather than go through the process of making it.

As mentioned previously, the difficulty is static, as I could not figure out how to verify it if it could change

```javascript
const hash = require(__dirname+'/js/hashing.js')
const fs = require('fs')

class Miner {
    constructor(path) {
        const difficulty = 6
        this.path = path
        // this is for the printing later
        this.hashes = 0
        this.dhash = 0
        this.t1 = Date.now()
        this.t2 = Date.now()
        this.tt = Date.now()
        // difficulty is static
        this.block = {
            "header": {
                "type": "bk"
            },
            "body": {
                "difficulty": difficulty
            }
        }

        var transactions = JSON.parse(fs.readFileSync(this.path+'txpool.json','utf-8'))
        this.block.body['transactions'] = transactions

        // parent and height
        var top = this.getTopBlock()
        if (top === null) {
            this.block.body['parent'] = '0000000000000000000000000000000000000000000000000000000000000000'
            this.block.body['height'] = 0
        } else {
            var blockchain = JSON.parse(fs.readFileSync(this.path+'blockchain.json','utf8'))
            this.block.body['parent'] = top
            this.block.body['height'] = blockchain[top].height+1
        }
        // miner
        var wallets = JSON.parse(fs.readFileSync(this.path+'wallets.json','utf-8'))
        var miner = wallets[0].public
        this.block.body['miner'] = miner

        postMessage('Block formed, mining initiated')
    }

    mine() {
        // repeatedly hashes with a random nonce
        while (true) {
            this.rand((nonce) => {
                this.block.body['nonce'] = nonce
                // t2 is updated every loop
                this.block.body['time'] = this.t2
                this.hashBlock(this.block.body,(hash) => {
                    this.hashes++
                    this.dhash++
                    // checks difficulty
                    var pass = true
                    for (var i = 0; i < this.block.body.difficulty; i++) {
                        if (hash.charAt(i) !== 'a') {
                            pass = false
                        }
                    }
                    this.t2 = Date.now()
                    // this triggers if the block has passed the difficulty test
                    if (pass) {
                        postMessage('Hash found! Nonce: '+nonce)
                        postMessage(hash)
                        postMessage(this.block)
                        // get rid of the pending transactions
                        fs.writeFileSync(this.path+'txpool.json','[]','utf-8')
                        // set the new block things
                        this.block.body.transactions = []
                        var top = this.getTopBlock()
                        this.block.body['parent'] = hash
                        this.block.body['height'] += 1 
                    } else {
                        // printing for the console
                        if ((this.t2-this.t1) > 10000) {
                            // calculate hashes per second (maybe)
                            // *1000 turns it into seconds
                            var hs = (this.dhash/(this.t2-this.t1))*1000
                            this.dhash = 0
                            this.t1 = Date.now()
                            postMessage('Hashing at '+hs.toFixed(3)+' hashes/sec - '+this.hashes+' hashes in '+Math.floor((this.t1-this.tt)/1000)+' seconds')

                            // check to see if the block has updated
                            fs.readFile(this.path+'txpool.json','utf-8',(err,content) => {
                                if (err) {
                                    // if the file doesn't exist, set content to []
                                    if (err.code === 'ENOENT') {
                                        content = '[]'
                                    } else {
                                        postMessage('Error opening file')
                                        throw err
                                    }
                                }
                                var current = JSON.stringify(this.block.body.transactions)
                                // change the transactions if they are different
                                if (current !== content) {
                                    var newtx = JSON.parse(content)
                                    this.block.body['transactions'] = newtx
                                    postMessage('Transactions updated')
                                }
                            })
                        }
                    }
                })
            })
        }
    }

    rand(callback) {
        callback(Math.floor(10000000000000000*Math.random()))
    }
    
    hashBlock(block,callback) {
        var hashed = hash.sha256hex(JSON.stringify(block))
        callback(hashed)
    }

    getTopBlock() {
        const genesis = '0000000000000000000000000000000000000000000000000000000000000000'
        try {
            var data = fs.readFileSync(this.path+'blockchain.json','utf8')
        } catch(e) {
            return null
        }
        if (data === '{}' || data === '') {
            return null
        }
        var fullchain = JSON.parse(data)
        // get the origin block
        // as there is nothing under it to be wrong
        for (var best in fullchain) {
            if (fullchain[best].parent === genesis) {
                break
            }
        }
        if (typeof best !== 'undefined' && fullchain[best].parent === genesis) {
            // iterates through the fullchain
            for (var key in fullchain) {
                // larger height the better
                if (fullchain[key].height > fullchain[best].height) {
                    var candidate = true
                    // iterate down the chain to see if you can reach the bottom
                    // if the parent is undefined at any point it is not part of the main chain
                    // run out of time for a more efficient method
                    var current = key
                    var parent
                    while (fullchain[current].parent !== genesis) {
                        parent = fullchain[current].parent
                        if (typeof fullchain[parent] !== 'undefined') {
                            current = parent
                        } else {
                            candiate = false
                        }
                    }
                    if (candidate) {
                        best = key
                    }
                // otherwise, if they're the same pick the oldest one
                } else if (fullchain[key].height === fullchain[best].height) {
                    if (fullchain[key].time < fullchain[best].time) {
                        // see other comments
                        var candidate = true
                        var current = key
                        while (fullchain[current].parent !== genesis) {
                            parent = fullchain[current].parent
                            if (typeof fullchain[parent] !== 'undefined') {
                                current = parent
                            } else {
                                candiate = false
                            }
                        }
                        if (candidate) {
                            best = key
                        }
                    }
                }
            }
        } else {
            best = null
        }
        return best
    }
}

onmessage = (path) => {
    postMessage('Path recieved')
    try {
        var miner = new Miner(path.data)
        miner.mine()
    } catch(e) {
        postMessage('Error caught')
        if (typeof e !== 'string') {
            e = e.message
        }
        postMessage(e)
    }
}
```

I created a `Miner` class, which has multiple functions to recreate some of the functions that exist in the main program.

Starting from the top, the first issue I ran into was that this too seemed unable to `require` modules. As it turns out, I had to put the absolute file path for it to work, which is why I `require` the hash module like so:

```javascript
const hash = require(__dirname+'/js/hashing.js')
```

`__dirname` gets the path up to `/arbitra-client`, and then we concatenate `/js/hashing.js` to that to get the path to the file we want.

The next issue I ran into was trying to `file.js` working. I imported it the same way I imported `hashing.js`, but it kept on throwing an error that was approximately "`remote` is undefined". This took a great deal of debugging, but I eventually realised that since it was not an Electron renderer process, it did not have access to `electron.remote`. This was a real issue, as this is required to get the file path for `%APPDATA%`.

The solution was to get the file path in `mine.js`, and send it to the mining script using `postMessage()`. Since `network.js` also relies on `file.js`, I realised that in order to send the block it would need to be sent from `mine.js`. Therefore, in `mine.js`, I changed the part of the code that initalises the miner to this:

```javascript
miner = new Worker('js/mining-script.js')
miner.onmessage = (msg) => {
    if(typeof msg.data === 'string') {
        pre.innerHTML += 'Hello World'
    } else {
        console.log(JSON.stringify(msg.data))
        blockchain.addBlock(msg.data)
        network.sendToAll(msg.data)
    }
}
// Workers can't get remote so we need to send them the path manually
var path = remote.app.getPath('appData')+'/arbitra-client/'
miner.postMessage(path)
```

In this code, we get the file path that we need, then post a message to the miner. This way, they can get the path without using `electron.remote`.

When the miner posts a message, it is checked to see if it a string or not. If so, it is printed to `#console`. If not, it is assumed to be a block and added to the blockchain and sent to all nodes.

First of all, we need to create the constructor of `Miner()`, which can be seen here. It receives the file path and sets it as a class property. It then creates the block template, and sets all the variables that do not change from block to block. It also sets some properties that are used later to print the hashing rate later on.

An issue I had was similar to the problem I had with the message replies, as the constructor would end with the block still empty. This was because I was misusing callbacks again, and the block would be sent off before the callback had returned. To remedy this issue, instead of using `fs.readFile()` I used `fs.readFileSync()`, which as the name suggests returns syncronously. This meant that it had to wait for the data to return, but since this is running on a new thread it does not matter. This is the reason that I had to change `getTopBlock()` to be syncronous.

```javascript
class Miner {
    constructor(path) {
        const difficulty = 6
        this.path = path
        // this is for the printing later
        this.hashes = 0
        this.dhash = 0
        this.t1 = Date.now()
        this.t2 = Date.now()
        this.tt = Date.now()
        // difficulty is static
        this.block = {
            "header": {
                "type": "bk"
            },
            "body": {
                "difficulty": difficulty
            }
        }

        var transactions = JSON.parse(fs.readFileSync(this.path+'txpool.json','utf-8'))
        this.block.body['transactions'] = transactions

        // parent and height
        var top = this.getTopBlock()
        if (top === null) {
            this.block.body['parent'] = '0000000000000000000000000000000000000000000000000000000000000000'
            this.block.body['height'] = 0
        } else {
            var blockchain = JSON.parse(fs.readFileSync(this.path+'blockchain.json','utf8'))
            this.block.body['parent'] = top
            this.block.body['height'] = blockchain[top].height+1
        }
        // miner
        var wallets = JSON.parse(fs.readFileSync(this.path+'wallets.json','utf-8'))
        var miner = wallets[0].public
        this.block.body['miner'] = miner

        postMessage('Block formed, mining initiated')
    }
}
```

These following functions are a part of the `Miner` class.

To generate a random number for the nonce, I decided to put a wrapper around `Math.random()` so that it generates integers, by multiplying it by a large number. I decided to use `Math.random()` rather than the cryptographically secure alternative because being fast is more important than being completely unpredictable, as it just needs to be different from other people's guesses.

```javascript
rand(callback) {
    callback(Math.floor(10000000000000000*Math.random()))
}
```

Although mostly unneccessary, I wrapped `hash.sha256hex()` so that I could feed it objects and it would `stringify()` it.

```javascript
hashBlock(block,callback) {
    var hashed = hash.sha256hex(JSON.stringify(block))
    callback(hashed)
}
```

Since we can't use `blockchain.getTopBlock()` as it uses `file.js`, I had to repeat it in the `Miner` class. I also changed it so that it was syncronous, as explained earlier.

```javascript
getTopBlock() {
    const genesis = '0000000000000000000000000000000000000000000000000000000000000000'
    try {
        var data = fs.readFileSync(this.path+'blockchain.json','utf8')
    } catch(e) {
        return null
    }
    if (data === '{}' || data === '') {
        return null
    }
    var fullchain = JSON.parse(data)
    // get the origin block
    // as there is nothing under it to be wrong
    for (var best in fullchain) {
        if (fullchain[best].parent === genesis) {
            break
        }
    }
    if (typeof best !== 'undefined' && fullchain[best].parent === genesis) {
        // iterates through the fullchain
        for (var key in fullchain) {
            // larger height the better
            if (fullchain[key].height > fullchain[best].height) {
                var candidate = true
                // iterate down the chain to see if you can reach the bottom
                // if the parent is undefined at any point it is not part of the main chain
                // run out of time for a more efficient method
                var current = key
                var parent
                while (fullchain[current].parent !== genesis) {
                    parent = fullchain[current].parent
                    if (typeof fullchain[parent] !== 'undefined') {
                        current = parent
                    } else {
                        candiate = false
                    }
                }
                if (candidate) {
                    best = key
                }
            // otherwise, if they're the same pick the oldest one
            } else if (fullchain[key].height === fullchain[best].height) {
                if (fullchain[key].time < fullchain[best].time) {
                    // see other comments
                    var candidate = true
                    var current = key
                    while (fullchain[current].parent !== genesis) {
                        parent = fullchain[current].parent
                        if (typeof fullchain[parent] !== 'undefined') {
                            current = parent
                        } else {
                            candiate = false
                        }
                    }
                    if (candidate) {
                        best = key
                    }
                }
            }
        }
    } else {
        best = null
    }
    return best
}
```

Finally, the most important function `mine()`. When this is called, it will run indefinitely, hashing the block forever.

It first calls our `rand()` function to get the nonce, and adds the nonce to the block, as well as the current time. It then checks the difficulty by hashing the block and iterating through the hash. If it begins with as many `a`s as is stated in the block, then it passes. If so, it sends a message saying that the hash has been found, along with the nonce and the hash. It then sends the block, which will be sent on from `mine.js`. It then clears `txpool.json`, as those messages have now been sent, and increases the height and changes the parent to the hash that was just found.

```javascript
mine() {
    // repeatedly hashes with a random nonce
    while (true) {
        this.rand((nonce) => {
            this.block.body['nonce'] = nonce
            // t2 is updated every loop
            this.block.body['time'] = this.t2
            this.hashBlock(this.block.body,(hash) => {
                this.hashes++
                this.dhash++
                // checks difficulty
                var pass = true
                for (var i = 0; i < this.block.body.difficulty; i++) {
                    if (hash.charAt(i) !== 'a') {
                        pass = false
                    }
                }
                this.t2 = Date.now()
                // this triggers if the block has passed the difficulty test
                if (pass) {
                    postMessage('Hash found! Nonce: '+nonce)
                    postMessage(hash)
                    postMessage(this.block)
                    // get rid of the pending transactions
                    fs.writeFileSync(this.path+'txpool.json','[]','utf-8')
                    // set the new block things
                    this.block.body.transactions = []
                    var top = this.getTopBlock()
                    this.block.body['parent'] = hash
                    this.block.body['height'] += 1 
                }
            })
        })
    }
}
```

However, I also wanted it to print to the console occasionally to show that it was doing something. After much trial and error, I found the best way to do this was to use `this.t1` and `this.t2`. `t2` approximately the current time, and it is updated after every hash. `t1` is set in the constructor. Therefore, finding `this.t2-this.t1` will give time time in milliseconds since it started mining. I used this trigger code to run every 10 seconds - if `this.t2-this.t1` is larger than 10000 milliseconds, then it resets `t1` to the current time, and prints the hashing rate as well as the total number of hashes to the `#console`.

```javascript
if (pass) {
    postMessage('Hash found! Nonce: '+nonce)
    postMessage(hash)
    postMessage(this.block)
    // etc
} else {
    // printing for the console
    if ((this.t2-this.t1) > 10000) {
        // calculate hashes per second (maybe)
        // *1000 turns it into seconds
        var hs = (this.dhash/(this.t2-this.t1))*1000
        this.dhash = 0
        this.t1 = Date.now()
        postMessage('Hashing at '+hs.toFixed(3)+' hashes/sec - '+this.hashes+' hashes in '+Math.floor((this.t1-this.tt)/1000)+' seconds')
    }
}
```

To find how fast hashes are being generated, we use `this.dhash`, which is the number of hashes that have happened since the last interval. Dividing that by `this.t2-this.t1` then multiplying by 1000 gives the number of hashes per second. I cropped that to 3 decimal places by using `toFixed(3)`.  I found the total time since it started hashing using `tt`, which is set in the constructor and not changed. `t1-tt` gives the time in milliseconds since the constructor was called, which I then converted to seconds and rounded.

This is also a good opportunity to see if any more transactions have been added to `txpool.json`. We read that file, check to see if it's different, and if it is then we change the transactions in the block. The reason I decided to only do this every ten seconds is that doing that for every hash would slow the whole thing down with the reading operations, and would wear out the hard drive.

```javascript
// check to see if the block has updated
fs.readFile(this.path+'txpool.json','utf-8',(err,content) => {
    if (err) {
        // if the file doesn't exist, set content to []
        if (err.code === 'ENOENT') {
            content = '[]'
        } else {
            postMessage('Error opening file')
            throw err
        }
    }
    var current = JSON.stringify(this.block.body.transactions)
    // change the transactions if they are different
    if (current !== content) {
        var newtx = JSON.parse(content)
        this.block.body['transactions'] = newtx
        postMessage('Transactions updated')
    }
})
```

###### Testing

I tested this by navigating to the `mine` page and clicking "Start". After 30 seconds:

![mining](https://i.imgur.com/YGo2qVg.png)

After 420 seconds, it still had not found a block. This either means that the difficulty test doesn't work, or the difficulty is too high.

![420 seconds](https://i.imgur.com/b9UWbyc.png)

I will investigate this later on. However, this does show that the printing function works.

##### Viewing

Viewing the blockchain is very similar to the `history` page and `wallets`. The HTML, `view.html`, looks like this:

```html
<h1>Blockchain</h1>

<h2>View Blockchain</h2>

<div class="highlight-box">
    <h3>Blockchain</h3>
    <button id="mine-button">Mine</button>
    <div class="list" id="bk-list"></div>
</div>
```

`view.js` looks like this:

```javascript
const file = require('../file.js')
const blockchain = require('../blockchain.js')
const changePage = require('../changepage').changePage

function init() {
    document.getElementById('mine-button').addEventListener('click',() => {
        changePage('mine')
    })
    file.getAll('blockchain',(data) => {
        var chain = JSON.parse(data)
        var list = document.getElementById('bk-list')
        var listItem
        var block
        for (var hash in chain) {
            block = chain[hash]
            listItem = document.createElement('div')
            listItem.classList.add('list-item')
            // timestamp to date
            var date = new Date(block.time).toString()
            // pretty printing json
            var txs = JSON.stringify(block.transactions,null,4)
            listItem.innerHTML = '<p><b>Time:</b> '+date+'</p><p><b>Hash:</b> '+hash+'</p><p><b>Parent:</b> '+block.parent+'</p><p><b>Miner:</b> '+block.miner+'</p><p><b>Height:</b> '+block.height+'</p><p><b>Transactions:</b></p><pre>'+txs+'</pre>'
            list.appendChild(listItem)
        }
    })
}

exports.init = init
```

The only notable differences is that since `blockchain.json` is not an array, I used a for...in loop which gets the keys of the object.

I also printed the transactions as raw JSON in a `pre` element. When `stringify()`ing the JSON data, I gave it the extra parameters of `null` and `4` which should indent it with 4 spaces.

This needs the blockchain to work, so I will cover it in the Testing phase.

#### Settings

##### Network Settings

The things I wanted to be able to do from network settings are:

- manually ping nodes
- set `advertise` in the ping messages
- set the number of target connections
- refresh the target connections.

The first feature was already made for `testing.js`, so we can just copy that over. The next three change a file when a button is pressed.

As such, `network-settings.html` looks like this:

```html
<h1>Settings</h1>

<h2>Network Settings</h2>

<h3>Add node</h3>
<p>Enter an IP address, and it will attempt to connect.</p>
<input type="text" id="sendto"/>
<button id="send">Send ping</button>
<p id="pg-save" class="hidden">Ping sent</p>

<h3>Target connections</h3>
<p>The target number of connections that the client will try to get. Current: <span id="curr"></span></p>
<input type="number" id="target"/>
<button id="target-save">Save</button>
<p id="min-save" class="hidden">Option saved</p>

<h3>Advertise</h3>
<p>Sometimes, nodes will ask others to send a list of clients that they are in contact with. Your IP will only be shared if this setting is turned on.</p>
<select id="advertise">
    <option value="true">On</option>
    <option value="false">Off</option>
</select>
<button id="save">Save</button>
<p id="ad-save" class="hidden">Option saved</p>


<h3>Refresh connections</h3>
<p>Refresh this client's connections to other nodes.</p>
<button id="refresh">Refresh</button>
<p id="re-save" class="hidden">Connections refreshed</p>
```

I added messages confirming that the action has been completed, but are hidden by default. When the associated action is completed, `.hidden` will be removed confirming it did something.

Next, I created `network-settings.js`. The outer section looks like this:

```javascript
const network = require('../network.js')
const file = require('../file.js')

function init() {
    // setting the current target connections
    file.get('target-connections','network-settings',(target) => {
        document.getElementById('curr').textContent = target
    })
}

exports.init = init
```

This sets the span `#curr` with the current connection target that we have on file.

###### Manual Ping

To ping a node, all we need to do is get `advertise` from `network-settings.json`, use that to form a ping message, then send that to whatever is in the text box using `network.sendMsg()`.

When that is done, it removes `.hidden` from `#pg-save`,

```javascript
// ping an IP
document.getElementById('send').addEventListener('click',() => {
    file.get('advertise','network-settings',(data) => {
        var msg = {
            "header": {
                "type": "pg"
            },
            "body": {
                "advertise": data
            }
        }
        network.sendMsg(msg,document.getElementById('sendto').value)
        document.getElementById('pg-save').classList -= 'hidden'
    })
})
```

###### Target Connections

"Target connections" is a number that indicates how many connections the network should try to attain. If the number of connections is less that this, it will send out node requests until it reaches that number. By default this is 5.

This code simply uses `file.store()` to store the number in `#target` to `network-settings.json`.

```javascript
// saving the "target number of connections"
document.getElementById('target-save').addEventListener('click',() => {
    var min = document.getElementById('target').value
    file.store('target-connections',min,'network-settings',() => {
        document.getElementById('curr').textContent = min
        document.getElementById('min-save').classList -= 'hidden'
    })
})
```

###### Advertise

`advertise` is the variable used when creating error messages. All we need to do is get a value from the dropdown and store it in `network-settings.json`.

```javascript
// saving the advertise toggle
document.getElementById('save').addEventListener('click',() => {
    var options = document.getElementById('advertise')
    file.store('advertise',options.value,'network-settings',() => {
        document.getElementById('ad-save').classList -= 'hidden'
    })
})
```

###### Clear connections

This simply wipes `connections.json` and calls the `connect()` function. It also sets `#connections`, the counter in the corner, to 0.

```javascript
// refreshing the cache
document.getElementById('refresh').addEventListener('click',() => {
    file.storeAll('connections','[]')
    document.getElementById('connections').textContent = 0
    network.connect()
    document.getElementById('re-save').classList -= 'hidden'
})
```

##### Application Settings

Application settings is even simpler, as all I can think to put in it is:

- Clear data in `%APPDATA%`
- Save `wallets.json` to somewhere else
- show version number

`app-settings.html` looks like this:

```html
<h1>Settings</h1>

<h2>App Settings</h2>

<p>Application Version: <span id="version"></span></p>

<h3>Save wallets</h3>
<p>Save wallets.json to somewhere in your computer.</p>
<button id="save">Save</button>

<h3>Clear cached file</h3>
<p>Warning - this will delete any pending transactions, and you will have to redownload the blockchain. It will not delete your wallets.</p>
<button id="clear">Clear cache</button>
<p id="ca-save" class="hidden">Cache cleared</p>
```

The outer Javascript looks like this:

```javascript
const file = require('../file.js')
const version = require('../../package.json').version
const fs = require('fs')
const network = require('../network.js')
const dialog = require('electron').remote.dialog

function init() {
    // stuff goes here
}

exports.init = init
```

There are some extra inports in this file. We import both `fs` and `file.js`, because `file.js` can only store data in `%APPDATA%`. `dialog` is a part of Electron, and as such we need to access it through `electron.remote`.

I retrieved the version number by using `require()` on `package.json`, which is where that is stored. Getting the property `version` from that gives us the application version directly. We then set the version number using:

```javascript
document.getElementById('version').textContent = version
```

Next we need to save `wallets.json`. When the button is pressed, it uses `file.getAll()` to get `wallets.json`. It then opens a save dialog using `dialog.showSaveDialog()`. The "filters" are used for the extension dropdown thing in Windows. In the callback we get the file path, and use `fs.writeFile()` to save `wallets.json` to that file.

```javascript
document.getElementById('save').addEventListener('click',() => {
    file.getAll('wallets',(data) => {
        dialog.showSaveDialog({
                filters: [
                    // set default extensions
                    {name:'JSON',extensions:['json']},
                    {name:'All files',extensions:['*']}
                ]
            },(file) => {
            fs.writeFile(file,data,(err) => {
                if (err) throw err
            })
        })
    })
})
```

This solution used http://mylifeforthecode.com/getting-started-with-standard-dialogs-in-electron/

Next is the "clear cache" button. This sets all the files to their empty values, which is self-explanatory. It then sets `#connections` to 0 and calls `network.connect()`.

```javascript
document.getElementById('clear').addEventListener('click',() => {
    file.storeAll('blockchain',{})
    file.storeAll('balances',{})
    file.storeAll('connections',[])
    file.storeAll('network-settings',{"advertise":"true","target-connections":5})
    file.storeAll('recent-connections',[])
    file.storeAll('txpool',[])
    file.storeAll('recenttx',[])
    file.storeAll('sent',[])
    file.storeAll('error-log',[])
    document.getElementById('ca-save').classList.remove('hidden')
    document.getElementById('connections').textContent = 0
    console.warn('All files wiped')
    network.connect(false)
})
```

Notice that `network-settings.json` has it's default values set.

### Final Touches

These are minor improvements that were not major enough to warrent their own section.

#### Moving CSS

I moved the CSS to a new folder called `/static`, as well as the icons. I also downloaded the font-awesome file to this folder. I then changed `index.html` to this:

```html
<head>
    <meta charset="utf-8">
    <title>Arbitra Client</title>
    <link rel="stylesheet" href="static/style.css"/>
    <script defer src="renderer.js" type="text/javascript"></script>
    <script defer src="static/fontawesome.min.js"></script>
</head>
```

I also discovered that the `defer` tag exists, which only loads the Javascript file when the rest of the page is finished, so I moved `renderer.js` up to the header.

#### Height counter

In the original concept, I had included several counters beneath the balance total. I had removed all of these except `#connections` as that was the only one that worked. However, I liked having multiple counters so I decided to add one back in. Since it is easy to get the height of the top block, I decided to display the length of the blockchain.

I changed `index.html` to this:

```html
<ul>
    <li><i class="fa fa-fw fa-rss" aria-hidden="true"></i> <span id="connections">0</span> connections</li>
    <li><i class="fa fa-fw fa-chain" aria-hidden="true"></i> <span id="height">0</span> blocks in blockchain</li>
</ul>
```

`.fa-chain` is a chain icon. I also added `.fa-fw` to both icons so that they are a fixed width.

This looks like this:

![chain length](https://i.imgur.com/eB37Y9W.png)

Then, at the end of `blockchain.getTopBlock()`, I updated the counter

```javascript
                    ...
                    if (candidate) {
                        best = key
                    }
                }
            }
            document.getElementById('height').textContent = fullchain[best].height
        }
    } else {
        best = null
    }
    callback(best)
}
```

I also set it to 0 in the "clear cache" function in `app-settings`.

#### Icon and Splash Screen

I wanted for the application to have an icon, as otherwise the Electron logo is used. I made this in paint in about 30 seconds:

![au icons](https://i.imgur.com/CvjidNa.png)

I stored this in `/static`.

In `main.js`, I set the icon.

```javascript
win = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: false,
    icon: 'static/au-icon.png'
})
```

Something that had irritated me through development is that the application displays the HTML before the Javascript is fully loaded, so there is a time when the buttons are unresponsive but there is no indication that that is the case.

However, since `#body` is blank until the Javascript loads, after which it is replaced by the associated page, I realised that I could set `#body` to display the icon, and it would disappear when the Javascript loads. This visually indicates that the application is loaded.

I therefore added the icon to `index.html`

```html
<div id="body">
    <img src="static/au-icon.png" alt="splash image">
</div>
```

I added the following CSS to centralise it:

```css
#body > img {
    margin-top: calc(50vh - 100px);
    margin-left: calc(50% - 50px);
}
```

I then started the application to test it.

![splash screen](https://i.imgur.com/sMCykMz.png)

It worked, and was replaced by the `overview` page after a couple of seconds.

#### Overview page

Since `overview.js` doesn't do anything, and since it is loaded every time the application starts, I realised it would be a good place to make sure that all the JSON files exist. It is pretty much the same as the function in `app-settings.js`, but only sets a file to their empty state if they don't exist.

```javascript
const file = require('../file')
const blockchain = require('../blockchain.js')
function init() {
    // since it runs when you start the program
    // might as well check all the files exist
    file.getAll('txpool',(data) => {
        if (data === null || data === '') {
            file.storeAll('txpool',[])
        }
    })
    file.getAll('recenttx',(data) => {
        if (data === null || data === '') {
            file.storeAll('recenttx',[])
        }
    })
    file.getAll('network-settings',(data) => {
        if (data === null || data === '') {
            var defaults = {
                "advertise": "true",
                "target-connections": 5
            }
            file.storeAll('network-settings',defaults)
        }
    })
    file.getAll('blockchain',(data) => {
        if (data === null || data === '' || data === '[]') {
            file.storeAll('blockchain',{})
        }
    })
    file.getAll('balances',(data) => {
        if (data === null || data === '' || data === '[]') {
            file.storeAll('blockchain',{})
        }
    })
    file.getAll('connections',(data) => {
        if (data === null || data === '') {
            file.storeAll('connections',[])
        }
    })
    file.getAll('recent-connections',(data) => {
        if (data === null || data === '') {
            file.storeAll('recent-connections',[])
        }
    })
}

exports.init = init
```

I also realised that if a person tries to mine the blockchain without a wallet, it would break. Therefore, if `wallets.json` is empty, I generated a new wallet called "My Wallet". This way, everyone starts with a wallet.

```javascript
file.getAll('wallets',(data) => {
    if (data === null || data === '' || data === '[]') {
        ecdsa.createKeys((public, private, err) => {
            if(err) {
                console.error(err)
                alert(err)
            } else {
                var wallet = {
                    "name": "My Wallet",
                    "public": public,
                    "private": private,
                    "amount": 0
                }
                file.storeAll('wallets',[wallet])
            }
        })
    }
})
```

I also wanted the HTML on the page to be a helpful introduction on what is possible with Arbitra. Therefore, I changed `overview.html` to this:

```html
<h1>Arbitra</h1>

<p>Welcome to Arbitra!</p>

<br>

<h3>You can:</h3>

<p><i class="fa fa-fw fa-envelope" aria-hidden="true"></i> Send a transaction</p>
<p><i class="fa fa-fw fa-chain" aria-hidden="true"></i> Mine the blockchain for Arbitrary Units</p>
<p><i class="fa fa-fw fa-eye" aria-hidden="true"></i> View past transactions and the blockchain</p>
<p><i class="fa fa-fw fa-rss" aria-hidden="true"></i> Connect to other nodes on the network</p>

<br>

<p>Got any questions/feedback? Email me at <a href="mailto:hello@samuelnewman.uk">hello@samuelnewman.uk</a></p>
```

Which looks like this:

![overview page final](https://i.imgur.com/pw4bFFq.png)

### npm start script

To save me running `.\node_modules\.bin\electron .` every time, I added a script to `package.json`:

```json
{
  "name": "arbitra-client",
  "version": "0.2.0",
  "main": "main.js",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git://github.com/Mozzius/arbitra.git"
  },
  "dependencies": {
    "big-integer": "^1.6.26",
    "electron": "^1.8.3",
    "ip": "^1.1.5",
    "tiny-worker": "^2.1.2"
  },
  "scripts": {
    "start": ".\\node_modules\\.bin\\electron ."
  }
}
```

This means that I can use `npm start` in the console to start the application.

## Testing

In this section, I will attempt to verify that the application and the network work to the standard of the inital objectives.

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

![test 8.1](https://i.imgur.com/XMJdajo.png)

![test 8.2](https://i.imgur.com/Zt2dki8.png)

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

![test 9.1](https://i.imgur.com/T3PVRGw.png)

`C:\Users\Mozzi\Documents\wallets.json`:

```json
[{"name":"My Wallet","public":"71870e4352b2d266cbac8ffa88cc92c1b9c93b9c532ad972fa066404bb080010-beae4c7d8995824d2d600d09b4e4784a6a013973202154e28b134ad2c3efc937","private":"732e33449bf91ae9dcf4d7eef791301280bd64935b4cee6854d0d582db7bcd69","amount":100},{"name":"Test Wallet","public":"6bcfc9193ac2b8db237583afa9bb8a347f28ea1af6fb78856f077d3569a26e074fb62fbf8e7f8ad4842ef39da8490953b87b1492c4c219cdfe83a2743dbdc01e","private":"aee7882724828734665fd7810b4caaedbfbaf2e53c713bd919f98dd18657caf4","amount":0}]
```

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

## Evaluation

### Initial Objectives

| Objective                                                                                                   | Met?   | Comment                                                                                                   |
| ----------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| The user should be able to construct and send a valid transaction.                                          | Yes    | This does work, provided the wallet has the funds required.                                               |
| The program should be able to automatically parse, validate, and deal with messages.                        | Yes    | The `parseMsg()` calls functions with deal with all of the message types.                                 |
| The user should be able to mine the blockchain.                                                             | Yes    | The user can mine the blockchain using the `mine` page.                                                   |
| Users should be rewarded for mining the blockchain.                                                         | Yes    | Users are rewarded 50au per block.                                                                        |
| All transactions should be secured through the Elliptic Curve Digital Signature Algorithm.                  | Yes    | An ECDSA system was implemented and used.                                                                 |
| The user should be able to see sent transactions, their wallets, and the blockchain.                        | Yes    | Users can view sent transactions, their wallets, and the blockchain through the corresponding pages.      |
| The user should be able to change basic settings.                                                           | Yes    | There is both an `app-settings` and `network-settings` page with multiple options.                        |
| The program should connect to other clients automatically, and default to a IP that is running the program. | Yes    | Ping messages are automatically sent, with a friend's computer running as a backup node.                  |
| The program should be able to detect and reject invalid messages.                                           | Mostly | It detects obviously incorrect messages, but the system lacks sufficient depth and can easily be tricked. |
| The blockchain should function as described by the previous section.                                        | Mostly | The blockchain is a blockchain, but the difficulty is static.                                             |
| The user should be able to interact with the program through an easy-to-use UI.                             | Yes    | The UI is implemented using Electron and is easy-to-use.                                                  |
| The user should be able to save their wallets.                                                              | Yes    | Users can save wallets through the `app-settings` page.                                                   |

### Personal Thoughts

Whilst as a project, Arbitra has been very successful, I do not feel that I have made a cryptocurrency worth using. Even though it fulfilled all of the project goals in some capacity, the system is far too unstable. The point of a cryptocurrency is that it is built on trusting the mathematics and the protocols of which it consists, and whilst the maths may hold up (hopefully) the protocols are buggy and incomplete. My biggest issue was in the networking which I thoroughly underestimated the difficulty of, which meant that it took focus away from other parts of the app, most notable the lack of a dynamic difficulty.

If I were to start over, my biggest focus would be on ensuring that the protocol was fully planned out and tested. There is a surprising lack of information about running peer-to-peer networks using Node.js, and so a lot of the protocol was guesswork based on preconceptions about how things worked. I would also ensure that the mining system was a bit more planned out, as the unsolved bug in the testing phase proved. I would, however, have used the same approach of using Node.js and Electron, as they were powerful and well-suited for the task, for the most part.

I also am disappointed in the lack of focus on functions that deal with the blockchain. Whilst they work, they are very inefficient and I had to brute-force many tasks due to time constraints.

I am very happy with the UI (although it is irritating I couldn't find icons that fit with the Windows aesthetic), and I am very pleased with how the page system worked out. The code is modular and flexible, and I am happy that I did not need any libraries to deal with the UI except Electron. In fact, a personal goal was not to use modules outside of the standard library where possible, and I managed to end up with only four dependencies, including Electron. Whilst this was probably not the best idea if I was trying to make an actual cryptocurrency, it made me deal with a lot of things on a very low level, especially the cryptography, and ultimately made the project more interesting.

If I had more time, I would:

- Clean up the networking aspect and add the dynamic difficulty.
- Change the way mining works, possibly using another Electron renderer process instead.
- Make the styling better match a Windows application.
- Add a system to give the user more feedback outside of the developer console.
- Make some of the algorithms more efficient.
- Add a systen where you could request money through the network.
- Build the application so it could be run as a normal `.exe`

I had attempted to build the project, but however it was far more complex that anticipated and I had to settle with the `npm start` script due to time constraints.

## Code

### app

#### static

#### pages

#### js

##### pages