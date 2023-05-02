import {CorpController, LogController, OrderController} from "../entity"
import {ConfigController} from '../entity'
import {InstitutionType, Owner, LogAction, OwnerMatch, PatentOwnership} from '../../client/src/common/entity'
import {Patent} from '../../client/src/common/entity'
import {Order} from '../../client/src/common/entity'
import * as Time from "./time"
import {asID} from '../util/server'

class Cache {
    private cache = new Map()
    set(cycle: number, owner: Owner, points: number){
        if (!this.cache.has(cycle))
            this.cache.set(cycle, new Map())
        let c = this.cache.get(cycle)
        c.set(asID(owner._id), points)
    }
    get(cycle: number, owner?: Owner){
        const ret = this.cache.get(cycle)
        return owner ? ret?.get(asID(owner._id)) : ret
    }
}
const RatingCache = new Cache()

async function getForCycle(cycle: number){
    const list = await CorpController.all({type: InstitutionType.Corporation})
    const ret = []
    const c = RatingCache.get(cycle)
    for (let corp of list){
        let points = c?.get(asID(corp._id))
        if (isNaN(+points)){
            const log = await LogController.find({'owner._id': asID(corp._id),
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
    let last_cycle = Time.Time.cycle
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
        const events = await LogController.all({'owner._id': asID(corp._id),
            ts: Time.Time.cycleInterval(cycle)})
        let points = events.filter(f=>RatingActions.includes(f.action)).reduce(
            (p, c)=>p+c.points|0, 0)
        const orders = await OrderController.all({'owner._id': asID(owner._id), cycle})
        const conf = await ConfigController.get()
        orders.forEach(o=>points += Order.plan(o)>=0.5 ? conf.points.order.open : 0)
        const prev = await LogController.find({action: LogAction.CycleRating,
            'owner._id': asID(owner._id), name})
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

// Calculate rating each cycle
Time.addCycleEvent(calcCycle)


export const Rating = {
    get: getForAll,
    getCycle: getForCycle,
    calc: calcCycle
}

// Need proper calculations
export async function patent_points(patent: Patent, owner: Owner, prev: Owner[]){
    // Do not calculate points on non-servers
    if (!patent.served.some(o=>OwnerMatch(o, owner)))
        return
    const new_server = !prev.some(o=>OwnerMatch(o, owner))
    const conf = await ConfigController.get()
    const ownership = patent.fullOwnership && !new_server ?
        PatentOwnership.Partial : patent.ownership
    const pts = conf.points.patent[ownership][patent.weight]
    const points = new_server || patent.fullOwnership ? pts : 0
    if (!points)
        return 
    // Will forwards calulate if 
    await LogController.log({
        name: 'patent_points', info: 'patent_points',
        owner: owner, points, item: patent,
        action: ownership==PatentOwnership.Full ?
            LogAction.PatentForwardFull :
            LogAction.PatentForwardPart,
    })
}
