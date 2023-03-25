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
    basic: number
    cycle: number
}
class TimeControl extends F.Fetcher<TimeControlProps, TimeContolState> {
    L = L
    constructor(props){
        super(props)
        this.state = {value: props.value} as any
    }
    get fetchUrl(){ return '/api/time' }
    get time(){ return date.diff(undefined, this.state.basic, 1) }
    fetchState(data: any = {}){
        const {basic, cycle} = data
        return {item: data, basic, cycle}
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
        const {cycle, err} = this.state
        const time = this.time
        const current_cycle = (time/cycle)|0+1
        return <RB.Container>
          {err && <RB.Row><RB.Col><ErrorMessage field={err} /></RB.Col></RB.Row>}
          <RB.Row className='menu-list-row'>
            <RB.Col>{L('server_time')}</RB.Col>
            <RB.Col>{date.interval(time)}</RB.Col>
            <RB.Col>{L('server_cycle')}</RB.Col>
            <RB.Col>{current_cycle}</RB.Col>
            <RB.Col>
              <RB.Button onClick={()=>this.changeTime(date.ms.HOUR)}>
                {L('time_decrease', 1)}</RB.Button>
            </RB.Col>
            <RB.Col>
              <RB.Button onClick={()=>this.changeTime(-date.ms.HOUR)}>
                {L('time_increase', 1)}</RB.Button>
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