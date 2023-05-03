import * as date from '../../client/src/common/date'
import {TimeController} from '../entity/config'

export const Time = new date.Time({
    serverTime: 0,
    basicTime: 0,
    cycleLength: 12*date.ms.HOUR,
})

async function load(){
    const time = await TimeController.get()
    Object.assign(Time, time)
}
async function save(){ await TimeController.save(Time) }

export type TimeEvent = (iteration: number)=>{}
const events : [[number, TimeEvent]] = [] as any
const cycleEvents : TimeEvent[] = [] as any

const InitLoop : Function & {loop: NodeJS.Timer, iterations: number} = (()=>{
    InitLoop.iterations = 0
    InitLoop.loop = setInterval(()=>{
        const {iterations} = InitLoop
        for (let event of events){
            if (!(iterations%event[0]))
                event[1](iterations)
        }
        InitLoop.iterations++
    }, date.ms.SEC)
}) as any

const emitCycleChange = (initial: number)=>{
    let last = initial||1
    return async ()=>{
        const current = Time.cycle
        if (last==current)
            return
        for (let ev of cycleEvents)
            ev(last)
        last = current
    }
}

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

export async function start(){
    await load()
    InitLoop()
    // Update time each minute
    addIntervalEvent(date.sec.MIN, save)
    addIntervalEvent(date.sec.MIN/2, emitCycleChange(Time.cycle))
}
