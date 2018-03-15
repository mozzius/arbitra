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
            listItem.innerHTML = '<p><b>Time:</b> '+date+'</p><p><b>Hash:</b> '+hash+'</p><p><b>Parent:</b> '+block.parent+'</p><p><b>Miner:</b> '+block.miner+'</p><p><b>Height:</b> '+block.height+'</p><p><b>Transactions:</b></p><pre id="console">'+txs+'</pre>'
            list.appendChild(listItem)
        }
    })
}

exports.init = init