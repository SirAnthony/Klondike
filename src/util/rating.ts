import {CorpController, LogController} from "../entity"
import {InstitutionType, Owner, LogAction} from '../../client/src/common/entity'
import {Time} from "./time"
import * as date from '../../client/src/common/date'

class Cache {
    private cache = new Map()
    set(cycle: number, owner: Owner, points: number){
        if (!this.cache.has(cycle))
            this.cache.set(cycle, new Map())
        let c = this.cache.get(cycle)
        c.set(owner._id, points)
    }
    get(cycle: number, owner?: Owner){
        const ret = this.cache.get(cycle)
        return owner ? ret?.get(owner._id) : ret
    }
}
const RatingCache = new Cache()

async function getForCycle(cycle: number){
    const list = await CorpController.all({type: InstitutionType.Corporation})
    const ret = []
    const c = RatingCache.get(cycle)
    for (let corp of list){
        let points = c?.get(corp._id)
        if (isNaN(+points)){
            const log = await LogController.find({'owner._id': corp._id,
                name: `cycle_${cycle}`})
            if (log)
                RatingCache.set(cycle, corp.asOwner, log.points)
            points = log?.points|0
        }
        ret.push({owner: corp.asOwner, cycle, points})
    }
    return ret    
}

async function getForAll(){
    let last_cycle = Time.cycle
    const ret = []
    for (let i=1; i<last_cycle+1; i++)
        ret.push(await getForCycle(i))
    return ret
}

const RatingActions = [LogAction.PatentForwardFull, LogAction.PatentForwardPart,
    LogAction.PatentForwardLeftovers, LogAction.OrderClosed, LogAction.BonusRating,
    LogAction.MoneyLeftovers, LogAction.ResourceLeftovers]
async function calcCycle(cycle: number){
    const list = await CorpController.all({type: InstitutionType.Corporation})
    for (let corp of list)
    {
        const owner = corp.asOwner, name = `cycle_${cycle}`
        const events = await LogController.all({'owner._id': corp._id,
            ts: {$gt: Time.cycleLength*(cycle-1), $lte: Time.cycleLength*cycle}})
        const points = events.filter(f=>RatingActions.includes(f.action)).reduce(
            (p, c)=>p+c.points|0, 0)
        const prev = await LogController.find({action: LogAction.CycleRating,
            'owner._id': owner._id, name})
        if (prev && prev.points!=points) {
            console.error(`Updating points for ${corp.name} `+
                `cycle ${cycle}: ${prev.points} -> ${points}`);
            Object.assign(prev, {points})
            await prev.save()
        } else {
            await LogController.log({action: LogAction.CycleRating, owner,
                name, info: `points for cycle ${cycle}`, points})
        }
        RatingCache.set(cycle, owner, points)
    }
}

let last_cycle = 1
const timer = setInterval(async ()=>{
    const cur_cycle = Time.cycle
    if (last_cycle==cur_cycle)
        return
    await calcCycle(last_cycle)
    last_cycle = cur_cycle
}, date.ms.MIN/2)

export const Rating = {
    get: getForAll,
    getCycle: getForCycle,
    calc: calcCycle
}
