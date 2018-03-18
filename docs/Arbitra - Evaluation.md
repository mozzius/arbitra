## Evaluation

### Initial Objectives

| Objective                                                    | Met?   | Comment                                                      |
| ------------------------------------------------------------ | ------ | ------------------------------------------------------------ |
| The user should be able to construct and send a valid transaction. | Yes    | This does work, provided the wallet has the funds required.  |
| The program should be able to automatically parse, validate, and deal with messages. | Yes    | The `parseMsg()` calls functions with deal with all of the message types. |
| The user should be able to mine the blockchain.              | Yes    | The user can mine the blockchain using the `mine` page.      |
| Users should be rewarded for mining the blockchain.          | Yes    | Users are rewarded 50au per block.                           |
| All transactions should be secured through the Elliptic Curve Digital Signature Algorithm. | Yes    | An ECDSA system was implemented and used.                    |
| The user should be able to see sent transactions, their wallets, and the blockchain. | Yes    | Users can view sent transactions, their wallets, and the blockchain through the corresponding pages. |
| The user should be able to change basic settings.            | Yes    | There is both an `app-settings` and `network-settings` page with multiple options. |
| The program should connect to other clients automatically, and default to a IP that is running the program. | Yes    | Ping messages are automatically sent, with a friend's computer running as a backup node. |
| The program should be able to detect and reject invalid messages. | Mostly | It detects obviously incorrect messages, but the system lacks sufficient depth and can easily be tricked. |
| The blockchain should function as described by the previous section. | Mostly | The blockchain is a blockchain, but the difficulty is static. |
| The user should be able to interact with the program through an easy-to-use UI. | Yes    | The UI is implemented using Electron and is easy-to-use.     |
| The user should be able to save their wallets.               | Yes    | Users can save wallets through the `app-settings` page.      |

### Personal Thoughts

Whilst as a project, Arbitra has been very successful, I do not feel that I have made a cryptocurrency worth using. Even though it fulfilled all of the project goals in some capacity, the system is far too unstable. The point of a cryptocurrency is that it is built on trusting the mathematics and the protocols of which it consists, and whilst the maths may hold up (hopefully) the protocols are buggy and incomplete. My biggest issue was in the networking which I thoroughly underestimated the difficulty of, which meant that it took focus away from other parts of the app, most notable the lack of a dynamic difficulty.

If I were to start over, my biggest focus would be on ensuring that the protocol was fully planned out and tested. There is a surprising lack of information about running peer-to-peer networks using Node.js, and so a lot of the protocol was guesswork based on preconceptions about how things worked. I would also ensure that the mining system was a bit more planned out, as the unsolved bug in the testing phase proved. I would, however, have used the same approach of using Node.js and Electron, as they were powerful and well-suited for the task, for the most part.

I also am disappointed in the lack of focus on functions that deal with the blockchain. Whilst they work, they are very inefficient and I had to brute-force many tasks due to time constraints.

I am very happy with the UI (although it is irritating I couldn't find icons that fit with the Windows aesthetic), and I am very pleased with how the page system worked out. The code is modular and flexible, and I am happy that I did not need any libraries to deal with the UI except Electron. In fact, a personal goal was not to use modules outside of the standard library where possible, and I managed to end up with only four dependencies, including Electron. Whilst this was probably not the best idea if I was trying to make an actual cryptocurrency, it made me deal with a lot of things on a very low level, especially the cryptography, and ultimately made the project more interesting.

If I had more time, I would have:

- Cleaned up the networking aspect and added the dynamic difficulty.
- Changed the way mining works, possibly using another Electron renderer process instead.
- Made the styling better match a Windows application.
- Added a system to give the user more feedback outside of the developer console.
- Made some of the algorithms more efficient.
- Added a systen where you could request money through the network.