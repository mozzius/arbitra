# Arbitra

An A-level Computer Science project by Samuel Newman

## Documented Design - The Application

### Creating the Electron app

In order to start we need to create the Electron app. Since this is the first time I have used Electron, I followed the [Electron Quick Start guide](https://electron.atom.io/docs/tutorial/quick-start/).

First, we need to create the `package.json` file. This contains information about the application and where the main Javascript file is, in order to run it.

```json
{
  "name": "arbitra-client",
  "version": "0.1.0",
  "main": "main.js",
}
```

We then need to make the `main.js` files in order to create the window. This is taken verbatim from the quick start guide so that I can get the client up and running, I will document it later.

```javascript
const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 1280, height: 720})

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  //win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})
```

Then we need to include the HTML and CSS files. For this I used the HTML and CSS code from the concept in the UI Design section. I named these files `index.html` and `style.css`, respectively, and placed them in the same directory as the other two files.

Finally, we need to install Electron. Since I already had Node.js installed, I used the Node Package Manager to install it. After navigating to the directory where the rest of the project was using `cd <filename>`, I used the command `npm install --save electron`. Using the `--save` tag ensures that it is saved in the `node_modules` directory it creates.

![installing Electron](https://i.imgur.com/WFyRqxu.png)

It successfully installed! That image is just the top section of the install process as it outputs a large amount of irrelevant data. All that is left is to start up Electron. According to the Electron Quick Start Guide, the command to do this (from the directory) is `.\node_modules\.bin\electron .`.

![running the command](https://i.imgur.com/c0dk07k.png)

A few seconds later, the window appeared!

![arbitra running](https://i.imgur.com/AKCYpWO.png)

#### Removing the Frame

The default "chrome look" of the window is quite ugly. Luckily, it is quite simple to remove. We simply change

```javascript
function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 1280, height: 720})
  ...
```

to

```javascript
function createWindow () {
  // Create the brower window.
  win = new BrowserWindow({width: 1280, height: 720, frame: false})
  ...
```

This changes the window to look like this, which is a vast improvement.

![removed frame](https://i.imgur.com/dXOaYuF.png)

However, we now can't drag the window around, or close it. We need to be able to use the top area to move the window, and implement our own minimise and close buttons. For the time being, I will just implement the close button to avoid needing to find icons etc.

Luckily, dragging the window is easy - we add a property to the CSS called `-webkit-app-region`.

We want to make the purple area draggable, so we add `-webkit-app-region: drag` to `.dragbar`. This works, but I can't really demonstrate this with an image.

We now need it to close when it is clicked. My first attempt was to add the function call `onclick="closeWindow()"` to the HTML, and in `main.js` add the `closeWindow()` function:

```javascript
function closeWindow () {
    win.close()
}
```

However, this does not work. It turns out that, because Electron is based on the Google Chrome browser, there are two types of process: the **main process** and the **renderer processes**. The main process is like Chrome itself - it is a kind of background process. Then, each tab has it's own renderer process. This is why when you close a Chrome tab it doesn't close down Chrome itself. In our app, `main.js` is the main process, and in order to interact with the window to close it and do other functions, we need to create a renderer process for the main page. This file is the equivalent of the client-side Javascript that it normally used in front-end web development.

Therefore, I created `renderer.js`, and imported into the HTML at the bottom of the `body`.

```html
<script src="renderer.js"></script>
```

In renderer.js, we need to import a module in Electron called `remote`. `remote` is how to interface with the window. Then, we make the document call a function when the "ready state" changes. This function checks if the ready state is ready - effectively, this means that everything inside the if statement will only be called when the document is ready. This is necessary as if we try to select an element before it is ready, it would not work, meaning that it could leave the close button without an event listener

```javascript
const remote = require('electron').remote

document.onreadystatechange = function () {
  if (document.readyState == "complete") {

  }
}
```

With that done, we can add the event listener, which uses `remote` to get the current window, and then closes it.

```javascript
const remote = require('electron').remote

document.onreadystatechange = function () {
  if (document.readyState == "complete") {
    document.getElementById("close").addEventListener("click", function (e) {
      const window = remote.getCurrentWindow()
      window.close()
    })
  }
}
```

This works - we can now close the app using the `x`.

We can use this to create minimise and maximise functions:

```javascript
const remote = require('electron').remote

document.onreadystatechange = function () {
  if (document.readyState == "complete") {
    document.getElementById("min").addEventListener("click", function (e) {
      const window = remote.getCurrentWindow()
      window.minimize()
    })
    document.getElementById("max").addEventListener("click", function (e) {
      const window = remote.getCurrentWindow()
      if (window.isMaximized()) {
        window.unmaximize()
      } else {
        window.maximize()
      }	
    })
    document.getElementById("close").addEventListener("click", function (e) {
      const window = remote.getCurrentWindow()
      window.close()
    })
  }
}
```

The minimise function is simple, as it simply calls `window.minimize()` to minimise it, which is a function already in Electron. However, it is less simple for maximising the window, as the same button must also return the window to its old size. For this we call `window.isMaximized()`  to see if the window is maximised. If it is, we call `window.unmaximize()`, otherwise we call `window.maximize()`.

The solution to this problem used this site:
[http://mylifeforthecode.com/making-the-electron-shell-as-pretty-as-the-visual-studio-shell/](http://mylifeforthecode.com/making-the-electron-shell-as-pretty-as-the-visual-studio-shell/)

#### Changing pages

We obviously need to be able to change pages in the app, and so for this we will be creating a testing page. I copied the HTML code to a new page called `testing.html`. I then added to `.left` the following code:

```html
<a href="testing.html"><div class="subsec">Testing</div></a>
```

This should, when clicked, change the page from `index.html` to `testing.html`.

And it does. However, there is a problem, in that the app freezes and goes completely white for a second while the new page loads, which is unacceptable. This is because Electron is intended to host **Single Page Applications**, which load all the content at once then swap pieces out instead of completely reloading the page. This means that we need to create a system for doing this. Luckily, the app is set up in such a way that we have a div that we can change, and then keep everything else the same.

As it would be a real pain to keep everything in the `index.html` file and hide/unhide sections as we need them, I think that the best way of doing this would be to keep each page in a separate HTML file and then import them into `index.html` as needed using Javascript.

We can use the `innerHTML()` function in Javascript to do this. It takes a string, and when you apply it to an element it sets the children of the content to what the string is.

Before we do this, we need to set up the page we intent to change. First is the Overview - the main page. I created a new file called `overview.html`, and put it in a new directory called `pages`.

```html
<h1>Overview</h1>

<p>Welcome to Arbitra! This is placeholder text.</p>
```

I also changed `testing.html` and moved it to `pages`.

```html
<h1>Testing Page</h1>

<p>This is placeholder text for the testing page.</p>
```

Now, we need to create the function that changes pages. In `renderer.js`:

```javascript
const remote = require('electron').remote
const fs = require("fs")

function changePage(name) {
  var path = "\\pages\\"+name+".html";
  fs.readFile(path, 'utf-8', (err, data) => {
    if (err) {
      alert("An error ocurred reading the file :" + err.message)
      console.warn("An error ocurred reading the file :" + err.message)
      return
    }
    console.log("Page change: "+name)
    document.getElementById("body").innerHTML = data
  });
}

document.onreadystatechange = function () {
  if (document.readyState == "complete") {
    // Close Buttons go here

    // Changing pages
    // Default is overview
    changePage("overview")
  }
}
```

First we import the file system library, from Node.js, and set it to `fs`.

The `changePage()` function takes in the name of the page it changes to. It then creates the path name of where the pages are kept. It then uses `fs.readFile` to attempt to read the file.

If there's an error, it prints the error both in an alert and in the console. Otherwise, it prints that the page is changing, and then sets the `innerHTML` of `#body` to the data that that `fs.readFile` read.

However, there is a problem. When I tried to run this code, it threw an error.

![fs error](https://i.imgur.com/qElVuxb.png)

This is because it tried to read the file `C:\pages\overview.html` rather than `arbitra-client\pages\overview.html` . We can fix this by changing

```javascript
var path = "\\pages\\"+name+".html"
```

to

```javascript
var path = "pages\\"+name+".html"
```

This makes it a relative path rather than an absolute path, and so should now link to the correct file.

![fs working](https://i.imgur.com/flEdpKu.png)

Trying again, the application loads properly. This means the function works! We now need to turn the `.items` in the menu to buttons that change the pages. We can implement this using `document.getElementById()`. `() => {...}` is "arrow notation" for a function - it is a shorter way of writing `function() {...}`.

```javascript
// Changing pages
// Default is overview
changePage("overview")

document.getElementById("overview").addEventListener("click", () => {
    changePage("overview")
})
document.getElementById("testing").addEventListener("click", () => {
    changePage("testing")
})
```

I gave every menu item an ID, so that they can be selected.

```html
<div class="subsec" id="overview">Overview</div>
<div class="subsec">Transactions</div>
<div class="items" id="make">Make Transactions</div>
<div class="items" id="receive">Receive Transactions</div>
<div class="items" id="history">Transaction History</div>
<div class="subsec">Blockchain</div>
<div class="items" id="view">View Blockchain</div>
<div class="items" id="mine">Mine for Arbitrary Units</div>
<div class="subsec">Settings</div>
<div class="items" id="network">Network Settings</div>
<div class="items" id="app">Application Settings</div>
<div class="subsec" id="testing">Testing</div>
```

When we click the Testing button, it changes page! This means that the navigation works, and we can massively simplify the process of creating and changes pages.

![changing page working](https://i.imgur.com/8ZynQDi.png)

I also created a folder called `js`, where we can keep per-page Javascript files. Then in the `changePage` function, it imports the page's JS file, then calls a function which initialises the page. We use `exports` to expose functions in the file, in this case `init()`. In each per-page JS file (for example `testing.js`):

```javascript
function init() {
    console.log("Hello world!")
}

exports.init = init
```

Then in `changePage()`:

```javascript
function changePage(name) {
    var path = "pages\\" + name + ".html"
    fs.readFile(path, 'utf-8', (err, data) => {
        if (err) {
            alert("An error ocurred reading the file :" + err.message)
            console.warn("An error ocurred reading the file :" + err.message)
            return
        }
        console.log("Page change: " + name)
        document.getElementById("body").innerHTML = data
        const pageJS = require("./js/" + name + ".js")
        pageJS.init()
    })
}
```

```
Page change: testing
Hello world
```

It works. This means that we can properly separate the Javascript code into files.

##### Highlighting Menu Links

I noticed when implementing the menu that the highlighting on the menu items was inconsistent, as it only applies to the `.item`s and not the `.subsec`s. However, not all the `.subsec`s are divs, which means that we can't just apply the highlighting to them as well. We can simply fix these problems by giving all the `.item`s and `.subsec`s that are meant to be divs a new class, called `.link`. We then give the highlighting properties to the `.link` class.

Replacing `.left > .items:hover`:

```css
.link:hover {
	background-color: rgba(43, 43, 43, 0.5);
	cursor: pointer;
}
```

I also added `cursor: default` to `.subsec`. This means that the cursor when hovering over the menu items is consistent depending on whether it is a link or not.

### The crypto Module

`crypto` is a default module within Node.js that provides cryptographic functions, similar to Python's `hashlib`. They both provide wrappers around OpenSSL, which means that translating Python code from the experimentation phase should be fairly simple.

The first test is to hash a string using SHA-256. In order to do this in Javascript we need to first import `crypto` into the project. In `main.js`:

```javascript
const crypto = require('crypto')
```

This imports the `crypto` object and sets it as a constant.

The next step is to hash a string. Using the [documentation](https://nodejs.org/api/crypto.html#crypto_crypto), I wrote this code to hash the string `"something"`:

```javascript
// crypto testing

var data = "something"

var hash = crypto.createHash('sha256')
hash.update(data)
console.log(hash.digest("hex"))
```

According to the experimentation code in Python, this should yield the hash `3fc9b689459d738f8c88a3a48aa9e33542016b7a4052e001aaa536fca74813cb`

```comman
C:\Users\Mozzi\Documents\Programming\arbitra\arbitra-client>.\node_modules\.bin\electron .

3fc9b689459d738f8c88a3a48aa9e33542016b7a4052e001aaa536fca74813cb
```

It produced the same hash, which means that it works. Now, it would be good to put that into a function so that we can call it whenever we need to hash something. I also moved the function to `renderer.js`, as that is where it would be called.

```javascript
function sha256(data) {
  	// creates a sha256 hash, updates it with data, and turns it into a hexadecimal string
    var hash = crypto.createHash('sha256').update(data).digest("hex")
    return hash
}
```

As you can see, I've compacting the hashing to one line - it is still quite readable, and of course produces the same output.

### Networking

A fundamental part of Arbitra is the Arbitra Network - the application by itself means nothing if it cannot connect to others. This means that we need to implement a reliable peer-to-peer networking system.

The way Arbitra will implement this is using the `net` Node.js module. From it's documentation:

> The `net` module provides you with an asynchronous network wrapper. It contains methods for creating both servers and clients (called streams).

Because the internet is centered on a client-server model, where clients request and receive data from a central server, most of the Node.js documentation and functions were focused on this.

However, even though we want a peer-to-peer network, we can still use this model. The client can run a server, and when another client wants to send it data it can connect to the server as a client. The first client can reply in this connection, but it will then be cut off. If the first client wants to send something else to the second client it connects using their server.

We can simulate this over `localhost`, the computer's local network. We don't even need to run the client and server in a separate file in order to simulate the model. The two upcoming snippets are in `renderer.js`.

#### Server Example

```javascript
const net = require("net")
var server = net.createServer(function(socket) {
    console.log("Server created")
    socket.on("data", function(data) {
        console.log("Server received: " + data)
        var hashed = sha256(data)
        socket.write(hashed)
    })
    socket.on("end", socket.end)
})

server.listen(80)
```

First, it imports the `net` module.

It then creates a server. The server has a callback function which adds event listeners to the socket.

> A socket is the term for the endpoint of a communication stream across a network. If it is bi-directional (this one is), it can send data down the stream both ways.

The socket is how we interface with the data that the server receives. We can add an event listener using the `.on()` function. When the socket receives data, it will call the callback function applied to the `data` event listener, which in this case prints to the console whatever data that it receives, then hashes the data and sends it back down the stream to the client. In actual use, it would pass the data on to be processed. It sends the data back using `socket.write(hashed)`.

There is a second event listener that ends the socket when it detects an end, to make sure the socket on the sever side ends when the .

Finally, we call `server.listen()`, which starts the server listening on port `80`. We give it the parameter `80`, which is the HTTP port (to ensure traffic is not blocked). This means that the server will reply to all traffic on the network that is in port `80`.

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

Files will be in JSON (JavaScript Object Notation), because as the name suggests it is directly 

#### File Planning

There are several different files that we need to have. The obvious ones are listed here:

| Name |      |      |
| ---- | ---- | ---- |
|      |      |      |
|      |      |      |
|      |      |      |

