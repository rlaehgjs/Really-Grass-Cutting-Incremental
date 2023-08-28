function E(x){return new Decimal(x)};

const VER = 0.05
const EINF = Decimal.dInf
const BETA = false
const save_name = BETA ? "rgci_beta_save" : "gci_save"
const FPS = 30

Math.lerp = function (value1, value2, amount) {
	amount = amount < 0 ? 0 : amount;
	amount = amount > 1 ? 1 : amount;
	return value1 + (value2 - value1) * amount;
};

Math.logBase = function (value, base) {
    return Math.log(value) / Math.log(base);
}

Decimal.prototype.clone = function() {
    return this
}

Decimal.prototype.modular=Decimal.prototype.mod=function (other){
    other=E(other);
    if (other.eq(0)) return E(0);
    if (this.sign*other.sign==-1) return this.abs().mod(other.abs()).neg();
    if (this.sign==-1) return this.abs().mod(other.abs());
    return this.sub(this.div(other).floor().mul(other));
};

function softcap(x,s,p,m) {
    if (x >= s) {
        if ([0, "pow"].includes(m)) x = (x/s)**p*s
        if ([1, "mul"].includes(m)) x = (x-s)/p+s
        if ([2, "pow2"].includes(m)) x = (x-s+1)**p+s-1
    }
    return x
}

function scale(x, s, p, mode, rev) {
    return x.scale(s, p, mode, rev)
}

Decimal.prototype.softcap = function (start, power, mode, dis=false) {
    var x = this.clone()
    if (!dis&&x.gte(start)) {
        if ([0, "pow"].includes(mode)) x = x.div(start).max(1).pow(power).mul(start)
        if ([1, "mul"].includes(mode)) x = x.sub(start).div(power).add(start)
        if ([2, "exp"].includes(mode)) x = expMult(x.div(start), power).mul(start)
        if ([3, "log"].includes(mode)) x = x.div(start).log(power).add(1).mul(start)
    }
    return x
}

Decimal.prototype.scale = function (s, p, mode, rev=false) {
    s = E(s)
    p = E(p)
    var x = this.clone()
    if (x.gte(s)) {
        if ([0, "pow"].includes(mode)) x = rev ? x.div(s).root(p).mul(s) : x.div(s).pow(p).mul(s)
        if ([1, "exp"].includes(mode)) x = rev ? x.div(s).max(1).log(p).add(s) : Decimal.pow(p,x.sub(s)).mul(s)
        if ([2, "dil"].includes(mode)) {
            let s10 = s.log10()
            x = rev ? Decimal.pow(10,x.log10().div(s10).root(p).mul(s10)) : Decimal.pow(10,x.log10().div(s10).pow(p).mul(s10))
        }
        if ([3, "alt_exp"].includes(mode)) x = rev ? x.div(s).max(1).log(p).add(1).mul(s) : Decimal.pow(p,x.div(s).sub(1)).mul(s)
    }
    return x
}

Decimal.prototype.format = function (acc=2, max=9) { return format(this.clone(), acc, max) }

Decimal.prototype.formatGain = function (gain, mass=false) { return formatGain(this.clone(), gain, mass) }

function softcapHTML(x, start) { return E(x).gte(start)?` <span class='soft'>(softcapped)</span>`:"" }

Decimal.prototype.softcapHTML = function (start) { return softcapHTML(this.clone(), start) }

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function gainHTML(amt,gain,pass=0) {
    return pass>0?" <span class='smallAmt'>"+formatGain(amt,Decimal.mul(gain,pass))+"</span>":''
}

function getPlayerData() {
    let s = {
        grass: E(0),
        bestGrass: E(0),
        level: 0,
        xp: E(0),
        tier: 0,
        tp: E(0),

        upgs: {},
        autoUpg: {},

        maxPerk: 0,
        spentPerk: 0,

        plat: E(0),

        pp: E(0),
        bestPP: E(0),
        pTimes: 0,

        crystal: E(0),
        bestCrystal: E(0),
        cTimes: 0,

        options: {
            hideUpgOption: false
        },

        chalUnl: false,

        chal: {
            progress: -1,
            comp: [],
        },

        grasshop: 0,

        steel: E(0),
        sTimes: 0,
        sTime: 0,

        chargeRate: E(0),
        bestCharge: E(0),

        decel: false,
        aGrass: E(0),
        aBestGrass: E(0),
        aRes: {
            level: 0,
            xp: E(0),
            tier: 0,
            tp: E(0),
        },
        
        ap: E(0),
        bestAP: E(0),
        bestAP2: E(0),
        aTimes: 0,

        oil: E(0),
        bestOil: E(0),
        bestOil2: E(0),
        lTimes: 0,

        rocket: {
            total_fp: E(0),
            amount: E(0),
            part: 0,
        },

        momentum: E(0),

        gTimes: 0,
        gTime: 0,
        stars: E(0),
        lowGH: 1e300,

        astral: 0,
        astralPrestige: 0,
        sp: E(0),

        moonstone: 0,
        grassskip: 0,
        bestGS: 0,

        gsUnl: false,

        ghMult: false,
        gsMult: false,

        autoGH: false,
        autoGS: false,

        star_chart: {
            auto: [],
            speed: [],
            progress: [],
            ring: [],
            reserv: [],
        },

        fTimes: 0,
        fun: E(0),
        SFRGT: E(0),

        sacTimes: 0,
        dm: E(0),

        recel: false,
        unGrass: E(0),
        unBestGrass: E(0),
        unRes: {
            level: 0,
            xp: E(0),
            tier: 0,
            tp: E(0),
        },

        np: E(0),
        bestNP: E(0),
        bestNP2: E(0),
        nTimes: 0,

        cloud: E(0),
        bestCloud: E(0),
        bestCloud2: E(0),
        cloudUnl: false,

        grassjump: 0,

        planetoid: getPlanetoidSave(),
        constellation: getConstellationSave(),

        lunar: {
            active: [],
            level: new Array(LUNAR_OB.length).fill(0),
            lp: new Array(LUNAR_OB.length).fill(E(0)),
        },

        darkCharge: E(0),

        stardust: E(0),
        stargrowth: E(0),

        offline: { time: 0, current: 0, enabled: true },
        timewarp: { amt: 0, time: 0 },
        sn: getSupernovaSave(),

        hsj: 0,

        world: 'ground',

        time: 0,
        version: VER,
    }
    for (let x in UPGS) {
        s.upgs[x] = []
        s.autoUpg[x] = false
    }
    return s
}

function wipe(reload=false) {
    if (reload) {
        wipe()
        save()
        resetTemp()
        loadGame(false)
    }
    else player = getPlayerData()
}

function loadPlayer(load) {
    const DATA = getPlayerData()
    player = deepNaN(load, DATA)
    if (!player.version) player.version = 0
    player = deepUndefinedAndDecimal(player, DATA)
    convertStringToDecimal()

    let c = Date.now() - player.offline.current
    player.offline.time = player.offline.time === null || c < 60000 || !player.offline.enabled ? 0 : c
    player.offline.current = Date.now()
}

function checkVersion() {
    const DATA = getPlayerData()

    if (player.version < 0.0306 && player.rocket.total_fp > 0) {
        player.rocket.total_fp = E(0)
        player.rocket.amount = E(0)
        player.oil = E(0)
        player.bestOil = E(0)
        player.ap = E(0)
        player.bestAP = E(0)
        player.aGrass = E(0)
        player.aBestGrass = E(0)
        player.aRes.level = 0
        player.aRes.tier = 0
        player.aRes.xp = E(0)
        player.aRes.tp = E(0)

        player.steel = E(0)
        player.chargeRate = E(0)

        resetUpgrades('ap')
        resetUpgrades('oil')
        resetUpgrades('rocket')

        console.log('guh?')
    }

    if (player.version < 0.0401) {
        player.bestGS = Math.max(player.bestGS, player.grassskip)
    }
    
    if (player.version < 0.0404 && player.grassjump>=5) {
        player.lunar = DATA.lunar

        player.astralPrestige = 0

        player.grasshop = 0
        if (player.grassskip>60) player.grassskip = 60

        RESET.formRing.doReset()

        player.cloud = E(0)
        player.bestCloud = E(0)
        player.bestCloud2 = E(0)

        player.np = E(0)
        player.bestNP = E(0)
        player.bestNP2 = E(0)

        player.unGrass = E(0)
        player.unBestGrass = E(0)
        player.unRes.level = 0
        player.unRes.tier = 0
        player.unRes.xp = E(0)
        player.unRes.tp = E(0)

        if (player.grassjump>5) player.grassjump = 5

        RESET.sac.doReset()

        resetUpgrades('unGrass')
        resetUpgrades('np')
        resetUpgrades('cloud')

        if (player.planetoid.planetTier>10) player.planetoid.planetTier = 10

        resetUpgrades('planet')
        player.planetoid.planet = E(0)

        player.momentum = E(0)
        resetUpgrades('momentum')

        player.sfgrt = E(0)
        resetUpgrades('sfrgt')

        player.dm = E(0)
        resetUpgrades('dm')

        console.log('guh? ^2')
    }

    if (player.version < 0.05) {
        player.offline.current = Date.now();
        player.offline.time = 0;
    }
 
    player.lowGH = Math.max(player.lowGH,-60)

    player.version = VER
}

function deepNaN(obj, data) {
    for (let x = 0; x < Object.keys(obj).length; x++) {
        let k = Object.keys(obj)[x]
        if (typeof obj[k] == 'string') {
            if (data[k] == null || data[k] == undefined ? false : Object.getPrototypeOf(data[k]).constructor.name == "Decimal") if (isNaN(E(obj[k]).mag)) obj[k] = data[k]
        } else {
            if (typeof obj[k] != 'object' && isNaN(obj[k])) obj[k] = data[k]
            if (typeof obj[k] == 'object' && data[k] && obj[k] != null) obj[k] = deepNaN(obj[k], data[k])
        }
    }
    return obj
}

function deepUndefinedAndDecimal(obj, data) {
    if (obj == null) return data
    for (let x = 0; x < Object.keys(data).length; x++) {
        let k = Object.keys(data)[x]
        if (obj[k] === null) continue
        if (obj[k] === undefined) obj[k] = data[k]
        else if (data[k] !== null) {
            if (Object.getPrototypeOf(data[k]).constructor.name == "Decimal") obj[k] = E(obj[k])
            else if (typeof obj[k] == 'object') deepUndefinedAndDecimal(obj[k], data[k])
        }
    }
    return obj
}

function convertStringToDecimal() {
    
}

function cannotSave() { return !is_online }

function save(){
    player.offline.current = Date.now();

    let str = btoa(JSON.stringify(player))
    if (cannotSave() || findNaN(str, true)) return
    if (localStorage.getItem(save_name) == '') wipe()

    localStorage.setItem(save_name,str)
    tmp.prevSave = localStorage.getItem(save_name)
    console.log("Game Saved")
}

function load(x){
    if(typeof x == "string" & x != ''){
        loadPlayer(JSON.parse(atob(x)))
    } else {
        wipe()
    }
}

function exporty() {
    let str = btoa(JSON.stringify(player))
    if (findNaN(str, true)) {
        console.warn("Error Exporting, because it got NaNed")
        return
    }
    save();
    let file = new Blob([str], {type: "text/plain"})
    window.URL = window.URL || window.webkitURL;
    let a = document.createElement("a")
    a.href = window.URL.createObjectURL(file)
    a.download = "GCI Save - "+new Date().toGMTString()+".txt"
    a.click()
}

function export_copy() {
    let str = btoa(JSON.stringify(player))
    if (findNaN(str, true)) {
        console.warn("Error Exporting, because it got NaNed")
        return
    }

    let copyText = document.getElementById('copy')
    copyText.value = str
    copyText.style.visibility = "visible"
    copyText.select();
    document.execCommand("copy");
    copyText.style.visibility = "hidden"
    console.log("Exported to clipboard")
}

function importy() {
    let loadgame = eyJncmFzcyI6IjAiLCJiZXN0R3Jhc3MiOiIwIiwibGV2ZWwiOjAsInhwIjoiMCIsInRpZXIiOjAsInRwIjoiMCIsInVwZ3MiOnsiZ3Jhc3MiOlswLDAsMCwwLDBdLCJwZXJrIjpbMCwwLDAsMCwwLDAsMCwwLDBdLCJhdXRvIjpbNSw1LDMsMSwxLDEsMSwxLDEsMSwxLDEwLDEwLDEsMSwxLDEsMSwxLDEsMV0sInBsYXQiOls5LDEwMCwxMDAsMTAwLDEwMCwxMDAsMjUsMjUsMTAwLDEwMCwyNV0sInBwIjpbMCwwLDBdLCJhcCI6WzAsMCwwLDAsMCwwXSwibnAiOlsxMTA4NywxMTA4Myw2NzMwLDU5MV0sImNyeXN0YWwiOlswLDAsMCwwLDAsMF0sIm9pbCI6WzAsMCwwLDAsMCwwXSwiZmFjdG9yeSI6WzAsMCwwLDAsMCwwLDAsMF0sImZvdW5kcnkiOlswLDAsMF0sImdlbiI6WzAsMCwwLDBdLCJhc3NlbWJsZXIiOlsxLDEsMSwxLDEsMSwxLDEsMSwxLDEsMV0sImFHcmFzcyI6WzAsMCwwLDAsMCwwXSwicm9ja2V0IjpbMTAwMCwxMDAwLDEwMDAsMTAwMCwxMDAwLDEwMDAsMTAwMCwxMDAwLDEwMDAsMTAwMDAsMTAwMDBdLCJtb21lbnR1bSI6WzEsMSwxLDEsMSwxLDEsMSwxLDEsMTAwMCwxMDAwLDU2M10sIm1vb25zdG9uZSI6WzEwMCwxMDAsMTAwLDEwMCwxMDAsMTAwLDEwLDEwXSwiZnVubnlNYWNoaW5lIjpbMTAwLDEwMCwxMDAsMTAwLDEwMF0sImZ1bmRyeSI6WzkxOSwxMDAwLDEwMDAsMTAwMF0sInNmcmd0IjpbMTIzNiwxMDAwLDEwMDAsMTUsODcxLDEwMDAwLDEwMDAwXSwiZG0iOlsxMDAwLDEwMDAsMTAwMCwxMDAwLDEwMCw1LDEwMDAsNTAwXSwidW5HcmFzcyI6WzE2MTY1LDE2MTU3LDQwNTA4LDEzMDM0LDQwNDc3LDEwXSwicGxhbmV0YXJpdW0iOlsyNTAsNTM3Myw1MzY1LDEwLDBdLCJvYnNlcnYiOlsxMDAsMTAwLDEwMCwxMDAsMTAwLDEwMCwxMDAsMTAwLDEwMF0sImFzdHJvIjpbMTAwMCwxMDAwLDEwMDAsMTAwMCwxMDAwLDBdLCJjbG91ZCI6WzM4OTIsMzg5MiwzMTczLDMxNjJdLCJtZWFzdXJlIjpbMTAsMTAwMCwxMDAwLDEwLDk3NywwXSwicGxhbmV0IjpbNjg2LDEwMCw2ODAsMF0sImNvbnN0ZWxsYXRpb24iOls0MjUsNDAwLDE0NSwxLDIwMCw3NSwxNzVdLCJzdGFyZHVzdCI6WzAsMCwwLDBdfSwiYXV0b1VwZyI6eyJncmFzcyI6dHJ1ZSwicGVyayI6dHJ1ZSwiYXV0byI6ZmFsc2UsInBsYXQiOnRydWUsInBwIjp0cnVlLCJhcCI6dHJ1ZSwibnAiOnRydWUsImNyeXN0YWwiOnRydWUsIm9pbCI6dHJ1ZSwiZmFjdG9yeSI6dHJ1ZSwiZm91bmRyeSI6dHJ1ZSwiZ2VuIjp0cnVlLCJhc3NlbWJsZXIiOnRydWUsImFHcmFzcyI6dHJ1ZSwicm9ja2V0IjpmYWxzZSwibW9tZW50dW0iOnRydWUsIm1vb25zdG9uZSI6ZmFsc2UsImZ1bm55TWFjaGluZSI6ZmFsc2UsImZ1bmRyeSI6dHJ1ZSwic2ZyZ3QiOnRydWUsImRtIjp0cnVlLCJ1bkdyYXNzIjp0cnVlLCJwbGFuZXRhcml1bSI6dHJ1ZSwib2JzZXJ2IjpmYWxzZSwiYXN0cm8iOnRydWUsImNsb3VkIjp0cnVlLCJtZWFzdXJlIjp0cnVlLCJwbGFuZXQiOnRydWUsImNvbnN0ZWxsYXRpb24iOmZhbHNlLCJzdGFyZHVzdCI6ZmFsc2V9LCJtYXhQZXJrIjowLCJzcGVudFBlcmsiOjAsInBsYXQiOiIxLjA1NTA2NzgwMDQ0NDk0MTllOTQiLCJwcCI6IjAiLCJiZXN0UFAiOiIwIiwicFRpbWVzIjoyOTIsImNyeXN0YWwiOiIwIiwiYmVzdENyeXN0YWwiOiIwIiwiY1RpbWVzIjo2Mywib3B0aW9ucyI6eyJoaWRlVXBnT3B0aW9uIjp0cnVlfSwiY2hhbFVubCI6dHJ1ZSwiY2hhbCI6eyJwcm9ncmVzcyI6LTEsImNvbXAiOlsyMCwyMCwyMCwxMCwxMCwxMCwxMCwxMF19LCJncmFzc2hvcCI6Mzc3LCJzdGVlbCI6IjAiLCJzVGltZXMiOjE2NDIsInNUaW1lIjo4MTc1My40OTcwMDAwNjI5NywiY2hhcmdlUmF0ZSI6IjAiLCJiZXN0Q2hhcmdlIjoiMCIsImRlY2VsIjpmYWxzZSwiYUdyYXNzIjoiMCIsImFCZXN0R3Jhc3MiOiIwIiwiYVJlcyI6eyJsZXZlbCI6MCwieHAiOiIwIiwidGllciI6MCwidHAiOiIwIn0sImFwIjoiMCIsImJlc3RBUCI6IjAiLCJiZXN0QVAyIjoiMi4xMjAwMDI1MDYzMTkwMTNlNjcwNCIsImFUaW1lcyI6Nzc5LCJvaWwiOiIwIiwiYmVzdE9pbCI6IjAiLCJiZXN0T2lsMiI6IjQuOTgyMTY0Nzk0OTcyODE3ZTI1NDAiLCJsVGltZXMiOjM0Mywicm9ja2V0Ijp7InRvdGFsX2ZwIjoiMCIsImFtb3VudCI6IjAiLCJwYXJ0IjowfSwibW9tZW50dW0iOiI4LjI2ODI5NjA1NjkzNzA1N2U1NSIsImdUaW1lcyI6NDcxLCJnVGltZSI6ODg3NS4yMjgwMDAwMDA0OTgsInN0YXJzIjoiNi4xODkyMzc4MDE5NjAzMTVlMTQzIiwibG93R0giOi02MCwiYXN0cmFsIjo2NCwic3AiOiIxLjI4NzQ5NTYyNzgyNDQzNjdlMTk3MCIsIm1vb25zdG9uZSI6MjI1MDAwNTczMjM1NjYwLCJncmFzc3NraXAiOjEyNSwiYmVzdEdTIjozOSwiZ3NVbmwiOnRydWUsImdoTXVsdCI6dHJ1ZSwiZ3NNdWx0Ijp0cnVlLCJhdXRvR0giOnRydWUsImF1dG9HUyI6dHJ1ZSwic3Rhcl9jaGFydCI6eyJhdXRvIjpbMSwxLDEsMSwxLDEsMSwxLDEsMSwxLDEsMSwxLDFdLCJzcGVlZCI6WzEwLDEwLDEwLDEwLDEwLDEwLDEwLDUwLDEsMTAsMTAsMTAsMTAsMTAsMTAsMTAsMTAsMTAsMTBdLCJwcm9ncmVzcyI6WzEwLDEwLDEwLDksMTAsMTAsMTAsMTAsMTAsMTAsMTAwLDEwLDEwLDEwLDEwXSwicmluZyI6WzEwMCwxMDAsMTAwLDEwMCwxMDAsMTAwLDEwMCwxMDAsNSwxMDAsMTAwLDEwMCw1LDEwMCwxMDAsMTAwLDEwMCwxMDAsMTAwLDEwMCwxMDAsMTAwLDEwMCwxMDAsMTAwLDEwMCwxMDAsMTAwLDQwLDEwMCwxMDAsMjAsMTAwLDEwMCw0MCw0MCwxMDAsMTAwLDQwLDQwLDEwMCwyNywyMCwzOSwyMCwzOV0sInJlc2VydiI6WzEwMCwxLDEsMTAwLDEwMCwxLDUsMTAsMSwxLDEsMSwxMDAsMSwxLDYsMTAsMSw3NSw3NSwxLDEsMSwxLDEsMSw2NCw1NiwxLDEsMSwxLDM5LDEsMSwxXX0sImZUaW1lcyI6NTk5MCwiZnVuIjoiMy4zMjIzNDgxMjE0NDE5MDZlMTI0MCIsIlNGUkdUIjoiNC40NzYwNDI4ODM4NzQxMThlOTI0Iiwic2FjVGltZXMiOjM4LCJkbSI6IjIuNDUxNTgxMjM4ODg4ODcxNGUxNDMiLCJyZWNlbCI6ZmFsc2UsInVuR3Jhc3MiOiIzLjcxODk0NjM1MjU5MDUwN2UzOTMxIiwidW5CZXN0R3Jhc3MiOiIzLjcxODk0NjM1MjU5MDUwN2UzOTMxIiwidW5SZXMiOnsibGV2ZWwiOjE0MDUsInhwIjoiMS4wOTg1NTE0NTkzMTIwOGUxMzUwNCIsInRpZXIiOjUwOSwidHAiOiIxLjQ4MzAyMjQ5OTQyMzgyMWUxMTUzIn0sIm5wIjoiNi4zNzU2MjE2MzA0NTUyMzQ0ZTg3NyIsImJlc3ROUCI6IjYuMzc1NjIxNjMwNDU1MjM0NGU4NzciLCJiZXN0TlAyIjoiMS41MDExMDkxODc5NjI2NDAxZTg3NiIsIm5UaW1lcyI6MTgsInRpbWUiOjkwMTczMy44NjA5OTcxNjg2LCJ2ZXJzaW9uIjowLjA1LCJwbGFuZXRvaWQiOnsicG0iOiIyLjA4ODgxNTkzMjMzODUxMWU1MjQiLCJiZXN0UG0iOiIyLjA4ODgxNTkzMjMzODUxMWU1MjQiLCJsZXZlbCI6NjkzLCJ4cCI6IjEuMDA3NTg0NDEyODUyODA2ZTQxOCIsImZpcnN0RW50ZXIiOnRydWUsImFjdGl2ZSI6dHJ1ZSwicmluZyI6IjEuOTQ1NDc5OTEwMjU0NzMzNWUyMzciLCJiZXN0UmluZyI6IjYuNDMxOTc2MTU1MTAzMjg4ZTE1MyIsIm9ic2VydiI6IjUuNzA2OTgwNzQ5OTYzNmUzMCIsInJlc2VydiI6IjEuMTIzMjA2ODYxMjQ5MjIyM2UyNSIsImFzdHJvIjoiMS4wMjExMDQyNjI3MTg2MTdlMjEwIiwiYmVzdEFzdHJvIjoiMS4wMjExMDQyNjI3MTg2MTdlMjEwIiwibWVhc3VyZSI6IjQuMTU1MTczMTU0NjEyMjcxZTEwMCIsImJlc3RNZWFzdXJlIjoiNC4xNTUxNzMxNTQ2MTIyNzFlMTAwIiwicGxhbmV0IjoiNi4xMDUzMTc4OTMyNjQ0NzJlNTQiLCJwbGFuZXRUaWVyIjozNiwiYmVzdFBsYW5ldCI6IjYuMTA1MzE3ODkzMjY0NDcyZTU0In0sImNsb3VkIjoiMi41MjY2OTgwMzI4NzY3MjIzZTMwOCIsImJlc3RDbG91ZCI6IjIuNTI0OTEzNDEzNzQwNjM3ZTMwOCIsImJlc3RDbG91ZDIiOiI1Ljk0ODczMDQ1MzcwODk0ZTMwNiIsImNsb3VkVW5sIjp0cnVlLCJhc3RyYWxQcmVzdGlnZSI6NCwiZ3Jhc3NqdW1wIjoyNCwiY29uc3RlbGxhdGlvbiI6eyJ1bmwiOnRydWUsImxpbmUiOiI0LjE3MjgzNTk1Nzg0NDQzODVlNTAiLCJhcmMiOiIxLjI0Mzg0NDQ4NDk0OTc1MWUyMiIsImFyY1VubCI6dHJ1ZSwiZ3JpZCI6W1siOHQ5IiwiNXQxMSIsIjh0OSIsIjh0OSIsIjV0MTEiLCI4dDEwIiwiOHQxMCJdLFsiNXQxMSIsIjB0MTEiLCIxMnQ2IiwiNXQxMSIsIjB0MTEiLCIxMnQ2IiwiOHQ5Il0sWyI4dDkiLCI1dDExIiwiOHQ5IiwiOHQ5IiwiNXQxMSIsIjExdDkiLCIxMnQ2Il0sWyI1dDExIiwiMHQxMSIsIjEydDYiLCIxMXQ5IiwiMTJ0NiIsIjJ0MTEiLCIxMnQ2Il0sWyI4dDkiLCI1dDExIiwiOHQ5IiwiMTF0OSIsIjEydDYiLCIydDExIiwiMTJ0NiJdLFsiNXQxMSIsIjB0MTEiLCIxMnQ2IiwiMTF0OSIsIjEydDYiLCIxMHQ5IiwiMTJ0NiJdLFsiOHQ5IiwiNXQxMSIsIjh0OSIsIjEwdDkiLCIxMnQ2IiwiMnQxMSIsIjEydDYiXV0sInByZXNldHMiOlt7ImVuY29kZSI6Ijh0OCw1dDEwLDh0OCw4dDgsNXQxMCw4dDksOHQ5LDV0MTAsMHQxMSwxMnQ1LDV0MTAsMTB0OCwxMnQ1LDh0OSw4dDgsNXQxMCwxMHQ4LDEydDUsNXQxMCwxMXQ4LDEydDUsNXQxMCwwdDExLDEydDUsMTF0OCwxMnQ1LDJ0MTEsMTJ0NSw4dDgsNXQxMCw4dDgsMTF0OCwxMnQ1LDJ0MTEsMTJ0NSw1dDEwLDB0MTEsMTJ0NSwydDExLDEydDUsMTB0OCwxMnQ1LDh0OCw1dDEwLDh0OCwxMHQ4LDEydDUsMnQxMSwxMnQ1IiwiY29zdCI6WyIxLjM5OTQzNzE3NjEzNjk1MWU0MSIsIjUuMTgwMDAwMDAwMDAwMDAxNWUxOCJdLCJib29zdHMiOiJMaW5lcyJ9LHsiZW5jb2RlIjoiM3QxMCwzdDEwLDN0MTAsM3QxMCwzdDEwLDN0MTAsM3QxMCwzdDEwLDN0MTAsM3QxMCwzdDEwLDN0MTAsM3Q5LDN0MTAsM3QxMCwzdDEwLDN0MTAsM3QxMCwzdDEwLDN0OSwzdDEwLDN0MTAsM3QxMCwzdDEwLDN0MTAsM3QxMCwzdDksM3QxMCwzdDEwLDN0MTAsM3QxMCwzdDEwLDN0MTAsM3QxMCwzdDEwLDN0MTAsM3QxMCwzdDEwLDN0MTAsM3QxMCwzdDEwLDN0MTAsMnQxMSwxMHQ4LDEydDUsMTF0OCwxMnQ1LDh0OSw4dDkiLCJjb3N0IjpbIjQuNTY1MDA1ODA5Nzk5ODE1ZTM4IiwiMi40MDAwMDAwMDAwMDAwMDE3ZTE4Il0sImJvb3N0cyI6IlJpbmdzIn0seyJlbmNvZGUiOiI0dDEwLDR0OSw0dDksNHQ5LDR0MTAsNHQxMCw0dDEwLDR0MTAsNHQ5LDR0OSw0dDksNHQ5LDR0OSw0dDEwLDR0MTAsNHQ5LDR0OSw0dDksNHQ5LDR0OSw0dDEwLDR0MTAsNHQ5LDR0OSw0dDksNHQ5LDR0OSw0dDEwLDR0MTAsNHQ5LDR0OSw0dDksNHQ5LDR0OSw0dDEwLDR0MTAsNHQxMCw0dDEwLDR0MTAsNHQxMCw0dDEwLDh0OSw4dDksMTF0OCwxMnQ1LDEwdDgsMTJ0MywydDExLDEydDQiLCJjb3N0IjpbIjQuODM2NzIwMzM3Mjk0NTE2ZTM4IiwiMi4zMDAxMDAxMDAwMDAwMDA4ZTE4Il0sImJvb3N0cyI6Ikx1bmFyIFBvd2VycyJ9LHsiZW5jb2RlIjoiNnQ5LDZ0OCw2dDgsNnQ4LDZ0OCw2dDgsNnQ4LDZ0OCw2dDgsNnQ4LDZ0OCw2dDgsNnQ4LDZ0OCw2dDgsNnQ4LDZ0OCw2dDgsNnQ4LDZ0OCw2dDgsNnQ4LDZ0OCw2dDgsNnQ4LDZ0OCw2dDgsNnQ4LDZ0OCw2dDgsNnQ4LDZ0OCw2dDgsNnQ4LDZ0OCw2dDgsNnQ4LDZ0OCw2dDgsNnQ4LDZ0OCw4dDksOHQ5LDJ0MTEsMTJ0NCwxMHQ4LDEydDMsMTF0OCwxMnQ1IiwiY29zdCI6WyI0LjQ2MTIyNDI1OTc3MDA4OGUzOCIsIjIuMzAwMTAwMDk5OTk5OTgyZTE4Il0sImJvb3N0cyI6IkRhcmsgQ2hhcmdlIn0seyJlbmNvZGUiOiIydDExLDEydDYsOHQ4LDR0MTAsOHQ4LDEwdDksMTJ0NiwydDExLDEydDYsNHQxMCw3dDksNHQxMCwxMHQ5LDEydDYsOHQ4LDR0MTAsN3Q5LDR0MTAsN3Q5LDR0MTAsOHQ4LDR0MTAsN3Q5LDR0MTAsN3Q5LDR0MTAsN3Q5LDR0MTAsOHQ4LDR0MTAsN3Q5LDR0MTAsN3Q5LDR0MTAsOHQ4LDJ0MTEsMTJ0Niw0dDEwLDd0OSw0dDEwLDEwdDksMTJ0NiwydDExLDEydDYsOHQ4LDR0MTAsOHQ4LDEwdDksMTJ0NiIsImNvc3QiOlsiOS4xNzg1NTExNTU5MjI0MzhlNDAiLCI4LjQwMDc5OTk5OTk5OTkyNGUyMCJdLCJib29zdHMiOiJMdW5hciBQb3dlcnMsIEFyY3MifV19LCJsdW5hciI6eyJhY3RpdmUiOlszLDYsMiw0LDUsMSwwXSwibGV2ZWwiOlszNzAwLDM3MDAsMzcwMCwyLjM5MjUxMDY5MzYzNzM5MzZlKzc3LDM2NzUsNS4zNDk4MTY1NDc4NjkyNjA1ZSs3NiwyLjM5MjUxMDY5MzYzNzM5MzZlKzc3XSwibHAiOlsiMS40MzEwMjY4NTQ3OTI2MDFlMTU1IiwiMS40MzEwMjY4NTQ3OTI2MDFlMTU1IiwiMS40MzEwMjY4NTQ3OTI2MDFlMTU1IiwiMS40MzEwMjY4NTQ3OTI2MDFlMTU1IiwiMS40MzEwMjY4NTQ3OTI2MDFlMTU1IiwiMS40MzEwMjY4NTQ3OTI2MDFlMTU1IiwiMS40MzEwMjY4NTQ3OTI2MDFlMTU1Il19LCJkYXJrQ2hhcmdlIjoiNC4xMjQ3MjI4MjcxNTUxOWUxMjkiLCJzdGFyZHVzdCI6IjAiLCJzdGFyZ3Jvd3RoIjoiMCIsIm9mZmxpbmUiOnsidGltZSI6NjEwNDQsImN1cnJlbnQiOjE2OTMxMzM5NjgxODQsImVuYWJsZWQiOnRydWV9LCJ0aW1ld2FycCI6eyJhbXQiOjQsInRpbWUiOjE0NDQwLjA2MTAwMDIwNjE2Mn0sInNuIjp7InNvbGFyU2hhcmQiOiIwIiwiYmVzdFNTIjoiMTAiLCJiZXN0U1NFYXJuIjoiMTAiLCJ0cmlnZ2VyVGltZSI6ODE4NDIuNDYyMDAwMDYxMTIsInNvbGFyRmxhcmUiOiI5MDUwLjE5ODAyMDc5ODYxMyIsInRvdGFsU0ZFYXJuIjoiMSIsInRpbWVzIjoxLCJ0aWVyIjoiMSIsInNvbGFyVXBncyI6W1tdLFsyLDFdLFtudWxsLDEsMV0sW10sWzMsOSwxMywxOSwxLDcsNiwzLDE1LDI1XSxbXV0sInNyIjoiMCIsImVjbGlwc2UiOiIwIiwicmVtbmFudCI6IjAifSwiaHNqIjowLCJ3b3JsZCI6Imdyb3VuZCJ9
        if (loadgame != null) {
            let keep = player
            try {
                setTimeout(()=>{
                    if (findNaN(loadgame, true)) {
                        addNotify("Error Importing, because it got NaNed")
                        return
                    }
                    load(loadgame)
                    save()
                    resetTemp()
                    loadGame(false)
                    location.reload()
                }, 200)
            } catch (error) {
                addNotify("Error Importing")
                player = keep
            }
        }
}

function loadGame(start=true, gotNaN=false) {
    if (!gotNaN) tmp.prevSave = localStorage.getItem(save_name)
    wipe()
    load(tmp.prevSave)
    resetTemp()
    setupHTML()

    for (let x in UPGS) {
        UPGS_SCOST[x] = []
        for (let y in UPGS[x].ctn) UPGS_SCOST[x][y] = UPGS[x].ctn[y].cost(0)
    }

    for (let x in STAR_CHART) {
        SC_SCOST[x] = []
        for (let y in STAR_CHART[x]) SC_SCOST[x][y] = STAR_CHART[x][y].cost(0)
    }
    
    if (start) {
        for (let x = 0; x < 50; x++) updateTemp()
        checkVersion()
        //for (let x = 0; x < 10; x++) createGrass()
        grassCanvas()
        treeCanvas()
        checkConstellationCosts()
        updateConstellation()
        setInterval(checkNaN,1000)
        setInterval(()=>{
            checkConstellationCosts()
            updateConstellation()
        },1000)

        tmp.el.offline_box.setDisplay(false) 
        tmp.el.map.setDisplay(false) 

        updateHTML()

        setTimeout(()=>{
            tmp.el.app.setDisplay(true)
            if (player.offline.time > 0 && hasUpgrade('auto',0)) {
                simulateTime(player.offline.time/1e3, true)
            } else {
                setInterval(save,60000)
            }

            setInterval(loop,1000/FPS)
        },1000)
    }
}

function checkNaN() {
    if (findNaN(player)) {
        console.warn("Game Data got NaNed")

        resetTemp()
        loadGame(false, true)
    }
}

function findNaN(obj, str=false, data=getPlayerData()) {
    if (str ? typeof obj == "string" : false) obj = JSON.parse(atob(obj))
    for (let x = 0; x < Object.keys(obj).length; x++) {
        let k = Object.keys(obj)[x]
        if (typeof obj[k] == "number") if (isNaN(obj[k])) return true
        if (str) {
            if (typeof obj[k] == "string") if (data[k] == null || data[k] == undefined ? false : Object.getPrototypeOf(data[k]).constructor.name == "Decimal") if (isNaN(E(obj[k]).mag)) return true
        } else {
            if (obj[k] == null || obj[k] == undefined ? false : Object.getPrototypeOf(obj[k]).constructor.name == "Decimal") if (isNaN(E(obj[k]).mag)) return true
        }
        if (typeof obj[k] == "object") return findNaN(obj[k], str, data[k])
    }
    return false
}

function overflow(number, start, power, meta=1){
	if(isNaN(number.mag))return new Decimal(0);
	start=E(start);
	if(number.gte(start)){
        let s = start.iteratedlog(10,meta)
		number=Decimal.iteratedexp(10,meta,number.iteratedlog(10,meta).div(s).pow(power).mul(s));
	}
	return number;
}

Decimal.prototype.overflow = function (start, power, meta) { return overflow(this.clone(), start, power, meta) }

var is_online = true
const MAX_TICKS = 500

function simulateTime(sec, start=false) {
    let ticks = sec * FPS
    let bonusDiff = 0
    if (ticks > MAX_TICKS) {
        bonusDiff = (ticks - MAX_TICKS) / FPS / MAX_TICKS
        ticks = MAX_TICKS
    }

    is_online = false
    let max_tick = ticks
    tmp.el.offline_time.setHTML(formatTime(sec,0))

    document.getElementById('offline_skip').onclick = ()=>{
        clearInterval(calc_interval)

        updateTemp()

        let dt = (1/FPS+bonusDiff) * (ticks)
        calc(dt)
        
        if (start) {
            calcTimeWarp(dt)
            setInterval(save,60000)
        }
        is_online = true
        tmp.el.offline_box.setDisplay(false)
    }

    var calc_interval = setInterval(()=>{
        ticks--

        updateTemp()

        let dt = 1/FPS+bonusDiff
        calc(dt)
        if (start) calcTimeWarp(dt)

        tmp.el.offline_bar.changeStyle('width',Math.min(Math.max(1-ticks/max_tick,0),1)*100+"%")
        tmp.el.offline_ticks.setHTML(max_tick-ticks + " / " + max_tick)

        if (ticks <= 0) {
            clearInterval(calc_interval)
            if (start) {
                setInterval(save,60000)
            }
            is_online = true
            tmp.el.offline_box.setDisplay(false)
            return
        }
    },1)

    tmp.el.offline_box.setDisplay(true)
}
