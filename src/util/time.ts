import * as date from '../../client/src/common/date'
import {TimeController} from '../entity/config'

export const Time = new date.Time({
    serverTime: 0,
    basicTime: 0,
    cycleLength: 4*date.ms.HOUR,
})

export async function load(){
    const time = await TimeController.get()
    Object.assign(Time, time)
}
async function save(){ await TimeController.save(Time) }

export type TimeEvent = (iteration: number)=>{}
const events : [[number, TimeEvent]] = [] as any
const cycleEvents : TimeEvent[] = [] as any

const loop = setInterval(function(){
    let iterations = 0
return ()=>{
    for (let event of events){
        if (!(iterations%event[0]))
            event[1](iterations)
    }
    iterations++
}}(), date.ms.SEC)

const emitCycleChange = (()=>{
    let last_cycle = 1
return async function(){
    const cur_cycle = Time.cycle
    if (last_cycle==cur_cycle)
        return
    for (let ev of cycleEvents)
        ev(last_cycle)
    last_cycle = cur_cycle
}})()

export function addIntervalEvent(interval: number, event: TimeEvent){
    const prev = events.find(f=>f[1]==event)
    if (prev)
        prev[0] = interval
    else
        events.push([interval, event])
}
export function addCycleEvent(ev: TimeEvent){
    if (!cycleEvents.includes(ev))
        cycleEvents.push(ev)
}

// Update time each minute
addIntervalEvent(date.sec.MIN, save)
addIntervalEvent(date.sec.MIN/2, emitCycleChange)