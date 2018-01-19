const crypt = require('crypto')

// elliptic curve secp256k1
const curve = {
    a = 0,
    b = 7,
    p = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f,
    g = {
        x = 0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798,
        y = 0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8
    },
    n = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141
}

function sha256(data) {
    // creates a sha256 hash, updates it with data, and turns it into a hexadecimal string
    var hash = crypto.createHash('sha256').update(data).toString("hex")
    return hash
}

function onCurve(point) {
    // sees if point is on the curve y^2 = x^3 + ax + b
    if (point !== Infinity) {
        if ((point.y**2 - point.x**3 - curve.a*point.x - curve.b) % curve.p !== 0) {
            throw new Error("not on curve")
        }
    }
}

function invMod(a,p) {
    // finds the inverse modulus using the
    // Extended Eucelidean Algorithm
    var x = 0, y = 1
    var oldx = 1, oldy = 0
    var r = p, oldr = a
    while (r !== 0) {
        quot = Math.floor(oldr / r)
        oldr = r
        r = oldr - quot * r
        oldx = x
        x = oldx - quot * x
        oldy = y
        y = oldy - quot * y
    }
    if (oldr === 1) {
        return x % p
    } else {
        throw new Error("a is 0, or p isn't prime")
    }
}

function addPoints(P1,P2) {
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
            var m = ((3*(P1.x**2)+curve.a)*invMod(2*P1y,curve.p))
        }
    } else {
        // finding gradient of line between 2 points
        var m = ((P2.y - P1.y)*invMod(P2.x-P1.x,curve.p))
    }
    // calculating other interception point
    var P3 = {
        x = ((m**2 - P1.x - P2.x) % curve.p),
        y = (-(P1.y + m*P3.x - m*P1.x) % curve.p)
    }
    onCurve(P3)
    return P3
}

function multiPoints(n,P) {
    if (P === Infinity) {
        return P
    }
    var total = "Infinity"
    var binary = (n >>> 0).toString(2)
    // reversed binary
    var yranib = binary.split("").reverse()
    // see documentation if confused, it's a bit mathsy
    // to explain in comments
    yranib.foreach(function(bit){
        if (bit == 1) {
            total = addPoints(total,P)
        }
        P = addPoints(P,P)
        onCurve(P)
    })
    onCurve(total)
    return total
}

function createKeys() {
    var rand = parseInt(crypto.randomBytes(256).toString("hex"),16)
    // make sure it's less than n
    var private = rand % curve.n
    // don't need to catch here because if
    // the generator is not on the curve, something
    // is definitly wrong
    var public = multiPoints(private,curve.g)
    return {private = private, public = public}
}

function signMsg(msg,w) {
    var rand = crypto.randomBytes(256).toString(10)
    // make sure it's less than n
    var k = rand % curve.n
    var z = parseInt(sha256(msg),16)
}