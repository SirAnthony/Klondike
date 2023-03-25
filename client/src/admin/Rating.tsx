import React from 'react';
import * as RR from 'react-router-dom'
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import {User} from '../common/entity'
import {Menu as UMenu} from '../util/controls'
import * as util from '../common/util'
import * as date from '../common/date'
import L from './locale'
import {ErrorMessage} from '../util/errors';

type TimeControlProps = {
    onUpdate: ()=>void
}
type TimeContolState = {
    time: date.Time
}
class TimeControl extends F.Fetcher<TimeControlProps, TimeContolState> {
    L = L
    constructor(props){
        super(props)
        this.state = {time: new date.Time()}
    }
    get fetchUrl(){ return '/api/time' }
    fetchState(data: any = {}){
        return {item: data, time: new date.Time(data)}
    }
    async changeTime(value: number){
        this.setState({err: null})
        const res = await util.wget('/api/admin/time', {method: 'PUT',
            data: {time: value}})
        if (res.err)
            return this.setState({err: res.err})
        this.fetch() 
        this.props.onUpdate()
    }
    render(){
        const {time, err} = this.state
        return <RB.Container>
          {err && <RB.Row><RB.Col><ErrorMessage field={err} /></RB.Col></RB.Row>}
          <RB.Row className='menu-list-row'>
            <RB.Col>{L('server_time')}</RB.Col>
            <RB.Col>{time.format}</RB.Col>
            <RB.Col>{L('server_cycle')}</RB.Col>
            <RB.Col>{time.cycle}</RB.Col>
            <RB.Col>
              <RB.Button onClick={()=>this.changeTime(date.ms.HOUR)}>
                {L('time_decrease', 1)}</RB.Button>
            </RB.Col>
            <RB.Col>
              <RB.Button onClick={()=>this.changeTime(time.cycleLength)}>
                {L('time_decrease', time.hoursInCycle)}</RB.Button>
              </RB.Col>
            <RB.Col>
              <RB.Button onClick={()=>this.changeTime(-date.ms.HOUR)}>
                {L('time_increase', 1)}</RB.Button>
            </RB.Col>
            <RB.Col>
              <RB.Button onClick={()=>this.changeTime(-time.cycleLength)}>
                {L('time_increase', time.hoursInCycle)}</RB.Button>
            </RB.Col>
          </RB.Row>
        </RB.Container>
    }
}

type MenuState = {

}
type MenuProps = {
    user: User
}
export class Navigator extends UMenu<MenuProps, MenuState> {
    L = L
    body(){
        return [<RB.Row>
           <TimeControl onUpdate={()=>{}} /> 
        </RB.Row>]
    }
}