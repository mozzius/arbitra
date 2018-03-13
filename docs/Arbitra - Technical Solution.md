# Arbitra

An A-level Computer Science project by Samuel Newman

## Technical Solution - Networking and Parsing

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

##### sha256

We need to convert the `sha256()` function we made earlier to return `bigInt`s. This is relatively easy.

```javascript
function sha256(data) {
    // creates a sha256 hash, updates it with data, and turns it into a bigint
    var hash = crypto.createHash('sha256').update(data).digest('hex')
    return bigInt(hash,16)
}
```

##### onCurve

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

##### invMod

`big-integer` has an `modInv()` function which is identical, but is designed to work specifically with `bigInt`s, so I decided to use that instead.

##### addPoints

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

##### multiPoints

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

##### createKeys

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

##### signMsg

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

##### verifyMsg

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

This means that it works! We can now use `ecdsa.js` to sign and verify messages.

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

#### store

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

#### get

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

#### getAll

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

#### storeAll

`storeAll()` is even simpler.

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

#### append

Append is very similar to `get()`, but rather than the stuff with `Array.isArray()`, it simply appends the data to the file using `jsondata.push()`.

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

I decided the best place for this is within the `network.init()` function, after we set the server running. First of all, we need to wipe `connections.json`, as this is meant to contain current connections and it is unknown if those connections are still there. Therefore, we remove it's contents when the application starts. This uses `file.storeAll()`, which again is a function that we have not defined, but stores the second parameter's data in the file with the name of the first parameter. In this case, it stores an empty array.

```javascript
    // wipe connections
    // this will be populated with connections that succeed
    file.storeAll('connections',[])
```

Next, we need to connect to the nodes listed in `recent-connections.json`, to reaffirm that they are still around. I decided to put this in a function called `connect()`.

#### connect



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

#### parseMsg

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
            reply = pg(msg)
        } else if (msg.header.type === 'nr') {
            reply = nr(msg)
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

#### Verifying Different Message Types

To make things a bit clearer, I decided to split these functions into a new file, `verify.js`, so that `parseMsg()` is more readable. However, this means that each of the functions like `tx()` will be converted to `verify.tx()`.

The first of these functions is `pg()`. Since we need the IP of the node that sent it, we pass the IP as well as the message.

##### pg

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

This looks mostly good! However, I noticed that in the reply, it doesn't reply with a value for `advertise`, which is a problem. Looking again at the code for `pg()`:

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

###### Restructuring parseMsg

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
                parse.nr(msg,callback)
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