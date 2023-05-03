import {ConfigController} from '../entity'
import {ResourceType} from '../../client/src/common/entity'
import {Time} from '../util/time'

export async function get_prices() : Promise<{[k in ResourceType]: number}> {
    const prices : {[k in ResourceType]: number}  = {} as any
    const conf = await ConfigController.get()
    const index = Math.max(0, Time.segments(Time.cycleLength/2))
    const res = conf.price.res.slice(0, index+1).pop()
    for (let k in res)
        prices[k] = res[k]
    return prices
}