const file = require('../file.js')
const blockchain = require('../blockchain.js')
const changePage = require('../changepage').changePage

function init() {
    document.getElementById('mine').addEventListener('click', function () {
        changePage('mine')
    })
    file.getAll('blockchain',(data) => {
        blockchain = JSON.parse(data)
        var list = document.getElementById('bk-list')
        var listItem
        var block
        for (var hash in blockchain) {
            block = blockchain[hash]
            listItem = document.createElement('div')
            listItem.classList.add('list-item')
            // timestamp to date
            // from https://stackoverflow.com/a/35890537
            var date = new Date(block.time*1000).toISOString().slice(-13, -5)
            // pretty printing json
            var txs = JSON.stringify(block.transactions,null,4)
            listItem.innerHTML = '<p><b>Time:</b> '+date+'</p><p><b>Hash:</b> '+key+'</p><p><b>Miner:</b> '+block.miner+'</p><p><b>Transactions:</b><p>'
            list.appendChild(listItem)
        }
    })
}

exports.init = init