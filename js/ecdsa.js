const crypt = require('crypto')
const bigInt = require('big-integer')

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

function randomNum(min=1,max=curve.n) {
    var randomValue = max.add(1)
    while (randomValue.compare(max) === -1 || randomValue.compare(min) === 1) {
        randomValue = bigInt(crypto.randomBytes(256).toString('hex'),16)
    }
    return randomValue.toString()
}

function sha256(data) {
    // creates a sha256 hash, updates it with data, and turns it into a bigint
    var hash = crypto.createHash('sha256').update(data).toString(10)
    return bigInt(hash)
}

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

function addPoints(P1, P2) {
    onCurve(P1)
    onCurve(P2)
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
            var m = ((3 * (P1.x ** 2) + curve.a) * invMod(2 * P1.y, curve.p))
        }
    } else {
        // finding gradient of line between 2 points
        var m = ((P2.y - P1.y) * invMod(P2.x - P1.x, curve.p))
    }
    // calculating other interception point
    var P3 = {
        x: ((m ** 2 - P1.x - P2.x) % curve.p),
        y: (-(P1.y + m * P3.x - m * P1.x) % curve.p)
    }
    onCurve(P3)
    return P3
}

function multiPoints(n, P) {
    if (P === Infinity) {
        return P
    }
    var total = Infinity
    var binary = (n >>> 0).toString(2)
    // reversed binary
    var yranib = binary.split('').reverse()
    // see documentation if confused, it's a bit mathsy
    // to explain in comments
    yranib.forEach(function (bit) {
        if (bit == 1) {
            total = addPoints(total, P)
        }
        P = addPoints(P, P)
        onCurve(P)
    })
    onCurve(total)
    return total
}

function createKeys(callback) {
    try {
        var private = random(1, curve.n)
        var public = multiPoints(private, curve.g)
    } catch (e) {
        callback(0, 0, err = true)
    }
    callback(public, private, err = null)
}

function signMsg(msg, w) {
    var rand = random(1, curve.n, function (rand) {
        var k = rand % curve.n
        var z = parseInt(sha256(msg), 16)
    })
}

exports.randomNum = randomNum