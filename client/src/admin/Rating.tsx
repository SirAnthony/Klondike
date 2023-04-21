import React from 'react';
import * as RR from 'react-router-dom'
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import {User} from '../common/entity'
import {Menu as UMenu} from '../util/controls'
import * as util from '../common/util'
import * as date from '../common/date'
import * as entity from '../common/entity'
import L from './locale'
import {ErrorMessage} from '../util/errors';
import {ConfigFetcher} from '../site/Config';
import {Config} from '../common/config'
import { NumberInput } from 'src/util/inputs';
import { InventoryEvents } from 'src/inventory';

type TimeControlProps = {}
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
        InventoryEvents.reloadTime()
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

function PatentWeigthChange(props: {conf: Config,
    type: entity.PatentOwnership, onChange: (c: Config)=>void}){
    const {conf, type, onChange} = props
    const keys = Object.keys(entity.PatentWeight).filter(f=>!isNaN(+f))
    const cols = keys.map(k=>[<RB.Col>
        {`points.patent.${type}.${k}`}
      </RB.Col>,
      <RB.Col>
        <NumberInput value={conf.points.patent[type][k]}
          placeholder={`points.patent.${type}.${k}`} onChange={val=>{
            const obj = Object.assign({}, conf)
            obj.points.patent[type][k] = val
            onChange(obj)
          }}/>
      </RB.Col>
    ]).flat()
    return <RB.Row>{cols}</RB.Row>
}

function PatentConfigChange(conf: Config, onChange: (c: Config)=>void){
    return [<RB.Row className='menu-list-row'>
      <RB.Col>
        {`points.patent.pay`}
      </RB.Col>
      <RB.Col>
        <NumberInput value={conf.points.patent.pay}
          placeholder={`points.patent.pay`} onChange={val=>{
            const obj = Object.assign({}, conf)
            obj.points.patent.pay = val
            onChange(obj)
          }}/>
      </RB.Col>
    </RB.Row>,
    <PatentWeigthChange conf={conf} type={entity.PatentOwnership.Full} onChange={onChange} />,
    <PatentWeigthChange conf={conf} type={entity.PatentOwnership.Partial} onChange={onChange} />]
}

function OrderSpecialityChange(props: {conf: Config, onChange: (c: Config)=>void}){
    const {conf, onChange} = props
    const keys = Object.keys(entity.PatentWeight).filter(f=>!isNaN(+f)).concat(['open'])
    const cols = keys.map(k=>[<RB.Col>
        {`points.order.${k}`}
      </RB.Col>,
      <RB.Col>
        <NumberInput value={conf.points.order[k]}
          placeholder={`points.order.${k}`} onChange={val=>{
            const obj = Object.assign({}, conf)
            obj.points.order[k] = val
            onChange(obj)
          }}/>
      </RB.Col>
    ]).flat()
    return <RB.Row className='menu-list-row'>
      {cols}
    </RB.Row>
}

type ConfigControlState = {}
type ConfigControlProps = {}

export class ConfigControl extends ConfigFetcher<ConfigControlProps, ConfigControlState> {
    L = L
    fetchState(data: any = {}){
        return {item: data, config: data}
    }
    async onSubmit(){
        const {config} = this.state
        const ret = await util.wget('/api/admin/config', {method: 'POST',
            data: {config}})
        if (ret.err)
            return this.setState({err: ret.err})
        InventoryEvents.reloadConfig()      
    }
    render(){
        const {config, err} = this.state
        if (!config)
            return <span>Not found</span>
        return <RB.Container>
          {err && <RB.Row><RB.Col><ErrorMessage field={err} /></RB.Col></RB.Row>}
          <RB.Row className='menu-list-row'>
            <RB.Col><RB.Button onClick={()=>this.onSubmit()}>
              {L('action_save')}
            </RB.Button></RB.Col>
          </RB.Row>
          <RB.Row className='menu-list-row'>
            <RB.Col>patent_close</RB.Col>
            <RB.Col><NumberInput value={config.points.patent_close}
              placeholder='patent_close' onChange={val=>{
                const obj = Object.assign({}, config)
                obj.points.patent_close = val
                this.setState({config: obj})
              }}
             /></RB.Col>
            <RB.Col>patent_pay</RB.Col>
            <RB.Col><NumberInput value={config.points.patent_close}
              placeholder='patent_pay' onChange={val=>{
                const obj = Object.assign({}, config)
                obj.points.patent_pay = val
                this.setState({config: obj})
              }}
             /></RB.Col>            
        </RB.Row>
        {PatentConfigChange(config, c=>this.setState({config: c}))}
        <OrderSpecialityChange conf={config}
          onChange={c=>this.setState({config: c})} />
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
           <TimeControl /> 
        </RB.Row>,
        <RB.Row>
          <ConfigControl />
        </RB.Row>
        ]
    }
}