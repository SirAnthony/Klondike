import {ConfigController, LogController} from '../entity'
import {ItemType, Resource, LogAction, ResourceType} from '../../client/src/common/entity'
import {Time} from '../util/time'

export async function get_prices() : Promise<{[k in ResourceType]: number}> {
    const prices : {[k in ResourceType]: number}  = {} as any
    const conf = await ConfigController.get()
    const cycle = Time.cycle
    const res = conf.price.res[cycle]
    for (let k in res)
        prices[k] = res[k]
    const entries = await LogController.all({'item.type': ItemType.Resource,
        action: LogAction.ItemPurchase, ts: Time.cycleInterval(cycle)})
    for (let l of entries){
        const res = l.item as Resource
        prices[res.kind] = (prices[res.kind]+(res.price/res.value||prices[res.kind]))/2
    }
    return prices
}