const crypto = require('crypto')
const bigInt = require('big-integer')
const hash = require('./hashing.js')

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
    while (randomValue.greater(max) || randomValue.lesser(min)) {
        // 32 bytes = 256 bits
        var buffer = crypto.randomBytes(32).toString('hex')
        randomValue = bigInt(buffer,16)
    }
    return randomValue
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

function multiPoints(n,P) {
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

exports.curve = curve
exports.createKeys = createKeys
exports.signMsg = signMsg
exports.verifyMsg = verifyMsg