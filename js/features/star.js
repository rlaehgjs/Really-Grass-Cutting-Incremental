UPGS.stardust = {
    unl: ()=>player.planetoid.active,

    title: "Stardust Upgrades",

    autoUnl: ()=>hasSolarUpgrade(0,13),
    noSpend: ()=>hasSolarUpgrade(0,13),

    req: ()=>player.grassjump>=30,
    reqDesc: ()=>`Reach 30 Grass-Jump to Unlock.`,

    underDesc: ()=>`You have ${format(player.stardust,0)} Stardust`+gainHTML(player.stardust,tmp.stardustGain,1),

    ctn: [
        {
            max: 1000,

            title: "Star Growth",
            desc: `Increase star grow speed by <b class="green">+5%</b> compounding per level.`,
        
            res: "stardust",
            icon: ["Curr/StarGrow"],
                        
            cost: i => Decimal.pow(1.15,i).mul(10).scale(1e33,3,2),
            bulk: i => i.scale(1e33,3,2,true).div(10).max(1).log(1.15).floor().toNumber()+1,
        
            effect(i) {
                let x = Decimal.pow(1.05,i)
        
                return x
            },
            effDesc: x => formatMult(x),
        },{
            max: 1000,

            title: "Stardust",
            desc: `Increase stardust generated by <b class="green">+15%</b> compounding per level.`,
        
            res: "stardust",
            icon: ["Curr/Stardust"],
                        
            cost: i => Decimal.pow(1.3,i).mul(25).scale(1e33,2,2),
            bulk: i => i.scale(1e33,2,2,true).div(25).max(1).log(1.3).floor().toNumber()+1,
        
            effect(i) {
                let x = Decimal.pow(1.15,i)
        
                return x
            },
            effDesc: x => formatMult(x),
        },{
            max: 1000,

            title: "Stardust XP",
            desc: `Increase the exponent of XP by <b class="green">+1%</b> per level.`,
        
            res: "stardust",
            icon: ["Icons/XP","Icons/Exponent"],
                        
            cost: i => Decimal.pow(2,i).mul(100),
            bulk: i => i.div(100).max(1).log(2).floor().toNumber()+1,
        
            effect(i) {
                let x = i/100+1
        
                return x
            },
            effDesc: x => formatPow(x),
        },{
            max: 1000,

            title: "Stardust Cosmic",
            desc: `Increase the exponent of Cosmic by <b class="green">+1%</b> per level.`,
        
            res: "stardust",
            icon: ["Icons/XP2","Icons/Exponent"],
                        
            cost: i => Decimal.pow(3,i).mul(1000),
            bulk: i => i.div(1000).max(1).log(3).floor().toNumber()+1,
        
            effect(i) {
                let x = i/100+1
        
                return x
            },
            effDesc: x => formatPow(x),
        },
    ],
}

function stardustGain() {
    let x = upgEffect('stardust',1)
    .mul(upgEffect('planetarium',4))
    .mul(upgEffect('astro',5))
    .mul(upgEffect('measure',5))
    .mul(upgEffect('planet',3))

    if (player.planetoid.planetTier>=40) x = x.mul(getPTEffect(5))

    x = x.mul(solarUpgEffect(3,0)).mul(solarUpgEffect(4,8)).mul(getASEff('sd'))

    return x
}

const THE_STAR = {
    get growSpeed() {
        let x = upgEffect('stardust',0,E(1))
        
        .mul(solarUpgEffect(4,0))
        .mul(solarUpgEffect(4,20))

        .mul(solarUpgEffect(5,2))
        .mul(solarUpgEffect(6,1))

        return x
    },
    starGrowthReq: [E(1e7),E(1e10),E(1e13),E(1e20),E(1e27)],
    get getStarTier() {
        let t = 0
        while (player.stargrowth.gte(this.starGrowthReq[t]??EINF)) t++;
        t = E(t)
        if (t.gte(2)) t = t.min(player.sn.eclipse.div(10).root(3).add(2).floor())
        return t
    },
    get getStarTierRequirement() {
        let st = tmp.starTier
        return [this.starGrowthReq[st.toNumber()]??EINF, st.gte(2) ? st.sub(1).pow(3).mul(10) : E(0)]
    },
    get calcETA() {
        let gs = tmp.growSpeed, req = this.getStarTierRequirement[0]

        if (gs.lte(0) || req.gte(EINF)) return "Forever"

        return formatTime(req.sub(player.stargrowth).div(tmp.growSpeed).max(0),0)
    },
}

tmp_update.push(()=>{
    tmp.stardustGain = stardustGain()
    tmp.growSpeed = THE_STAR.growSpeed
    tmp.starTier = THE_STAR.getStarTier
})

el.update.star = ()=>{
    let d = player.planetoid.active && player.grassjump >= 30

    tmp.el.star_div.setDisplay(d)

    if (d) {
        tmp.el.star_tier.setHTML(tmp.starTier.format(0))

        tmp.el.stargrowth.setHTML(player.stargrowth.format(0))
        tmp.el.growspeed.setHTML(tmp.growSpeed.format()+"/s")

        let st_req = THE_STAR.getStarTierRequirement

        tmp.el.starnexttier.setHTML(`
        <span class="cyan">${st_req[0].format(0)}</span>, ETA: ${THE_STAR.calcETA}`+(st_req[1].gt(0) ? `, <span class="yellow">Eclipse ${st_req[1].format(0)}</span>` : ""))
    }
}