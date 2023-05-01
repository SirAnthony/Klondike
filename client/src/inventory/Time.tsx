import React from 'react'
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import {InventoryEvents} from '../inventory'
import {default as L} from './locale'
import * as date from '../common/date'

type TimeState = {
    time?: date.Time
}
type TimeProps = {}
export class TimeDetails extends F.Fetcher<TimeProps, TimeState> {
    private static lastTime: date.Time
    static get Time(){ return TimeDetails.lastTime }

    interval: NodeJS.Timer
    constructor(props){
        super(props)
        this.state = {}
        InventoryEvents.onreloadTime(()=>this.fetch())
        this.interval = setInterval(()=>this.fetch(), date.ms.MIN/2)
    }
    get fetchUrl(){ return '/api/time' }
    fetchState(data: any){
        const time = new date.Time(data)
        TimeDetails.lastTime = time
        InventoryEvents.timeChanged()
        return {item: data, time}
    }
    render(){
        const {time} = this.state
        const text = [].concat.call([], date.timeday(undefined), time?.format).join(' | ')
        return <a href='/' className='nav-link'>{text}</a>
    }
}