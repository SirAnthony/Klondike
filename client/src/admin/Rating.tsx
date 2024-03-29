import React from 'react';
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import {User} from '../common/entity'
import {Menu as UMenu} from '../util/controls'
import * as util from '../common/util'
import * as date from '../common/date'
import * as entity from '../common/entity'
import {default as L, LR} from './locale'
import {ErrorMessage} from '../util/errors';
import {ConfigFetcher} from '../site/Config';
import {Config} from '../common/config'
import {NumberInput} from 'src/util/inputs';
import {InventoryEvents} from 'src/inventory';
import {Delimeter} from 'src/util/components';

type TimeControlProps = {}
type TimeContolState = {
    time: date.Time
    cycleLength: number
}
class TimeControl extends F.Fetcher<TimeControlProps, TimeContolState> {
    L = L
    constructor(props){
        super(props)
        const time = new date.Time()
        this.state = {time, cycleLength: time.cycleLength/date.ms.HOUR}
    }
    get fetchUrl(){ return '/api/time' }
    fetchState(data: any = {}){
        const time = new date.Time(data)
        return {item: data, time, cycleLenth: time.cycleLength/date.ms.HOUR}
    }
    async changeTime(value: number){
        this.setState({err: null})
        const {cycleLength} = this.state
        const res = await util.wget('/api/admin/time', {method: 'PUT',
            data: {time: value, cycleLength: cycleLength*date.ms.HOUR}})
        if (res.err)
            return this.setState({err: res.err})
        this.fetch()
        InventoryEvents.reloadTime()
    }
    render(){
        const {time, cycleLength, err} = this.state
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
              <RB.Button onClick={()=>this.changeTime(4*date.ms.HOUR)}>
                {L('time_decrease', 4)}</RB.Button>
              </RB.Col>
            <RB.Col>
              <RB.Button onClick={()=>this.changeTime(-date.ms.HOUR)}>
                {L('time_increase', 1)}</RB.Button>
            </RB.Col>
            <RB.Col>
              <RB.Button onClick={()=>this.changeTime(-4*date.ms.HOUR)}>
                {L('time_increase', 4)}</RB.Button>
            </RB.Col>
          </RB.Row>
          <RB.Row className='menu-list-row'>
            <RB.Col>{L('server_cycle_length')}</RB.Col>
            <RB.Col>
              <NumberInput value={cycleLength} placeholder={L('server_cycle_length')}
                onChange={cycleLength=>this.setState({cycleLength})} />
            </RB.Col>
            <RB.Col>
              <RB.Button onClick={()=>this.changeTime(0)}>{L('act_save')}</RB.Button>
            </RB.Col>
          </RB.Row>
        </RB.Container>
    }
}

function PatentWeigthChange(props: {conf: Config,
    type: entity.PatentOwnership, onChange: (c: Config)=>void}){
    const {conf, type, onChange} = props
    const keys = Object.keys(entity.PatentWeight).filter(f=>!isNaN(+f))
    const cols = keys.map(k=>[
      <RB.Col>{LR(`patent_weigth_${k}`)}</RB.Col>,
      <RB.Col>
        <NumberInput value={conf.points.patent[type][k]}
          placeholder={LR(`patent_weigth_${k}`)} onChange={val=>{
            const obj = Object.assign({}, conf)
            obj.points.patent[type][k] = val
            onChange(obj)
          }}/>
      </RB.Col>
    ]).flat()
    return <RB.Row className='menu-list-row'>{cols}</RB.Row>
}

function PatentConfigChange(conf: Config, onChange: (c: Config)=>void){
    return [<RB.Row className='menu-list-row'>
      <RB.Col>
        {L(`points.patent.pay`)}
      </RB.Col>
      <RB.Col>
        <NumberInput value={+conf.points.patent.pay}
          placeholder={L(`points.patent.pay`)} onChange={val=>{
            const obj = Object.assign({}, conf)
            obj.points.patent.pay = val
            onChange(obj)
          }}/>
      </RB.Col>
    </RB.Row>,
    <RB.Row className='menu-input-row'>
      <RB.Col>{L(`points.patent`, LR('patent_ownership_shared'))}</RB.Col>
    </RB.Row>,
    <PatentWeigthChange conf={conf} type={entity.PatentOwnership.Partial} onChange={onChange} />,
    <RB.Row className='menu-input-row'>
      <RB.Col>{L(`points.patent`, LR('patent_ownership_full'))}</RB.Col>
    </RB.Row>,
    <PatentWeigthChange conf={conf} type={entity.PatentOwnership.Full} onChange={onChange} />]
}

function OrderSpecialityChange(props: {conf: Config, onChange: (c: Config)=>void}){
    const {conf, onChange} = props
    const keys = Object.keys(entity.ResourceSpecialityType)
        .filter(f=>!isNaN(+f)).concat(['open', 'halfclosed'])
    const cols = keys.map(k=>[
      <RB.Col>{LR(`res_spec_value_${k}`)}</RB.Col>,
      <RB.Col>
        <NumberInput value={conf.points.order[k]}
          placeholder={LR(`res_spec_value_${k}`)} onChange={val=>{
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

function GamePaceChange(props: {conf: Config, onChange: (c: Config)=>void}){
    const {conf, onChange} = props
    const propChange = (prop, name)=>val=>{
        const parts = prop.split('.')
        const obj = {...conf}
        let cfg = obj
        for (let part of parts)
            cfg = cfg[part] = cfg[part]||{}
        cfg[name] = val
        onChange(obj)
    }
    const leftovers = async ()=>
        await util.wget('/api/admin/calc_leftovers', {method: 'PUT'})
    return <RB.Row className='menu-list-row'>
      <RB.Col>
        <NumberInput value={conf.time?.market} placeholder={L('time.market')}
          onChange={propChange('time', 'market')} />
      </RB.Col>
      <RB.Col>
        <NumberInput value={conf.time?.ship?.speed}
          placeholder={L('time.ship.speed')}
          onChange={propChange('time.ship', 'speed')} />
      </RB.Col>
      <RB.Col>
        <NumberInput value={conf.time?.ship?.research}
          placeholder={L('time.ship.research')}
          onChange={propChange('time.ship', 'research')} />
      </RB.Col>
      <RB.Col>
        <NumberInput value={conf.endgame ? 1 : 0}
          placeholder={L('endgame')} onChange={val=>{
            const obj = Object.assign({}, conf)
            obj.endgame = !!val
            onChange(obj)
          }} />
      </RB.Col>
      <RB.Col>
        <RB.Button onClick={leftovers}>{L('act_leftovers')}</RB.Button>
      </RB.Col>
    </RB.Row>
}

type ConfigControlState = {}
type ConfigControlProps = {}
class ConfigControl extends ConfigFetcher<ConfigControlProps, ConfigControlState> {
    L = L
    fetchState(data: any){ 
      // Missing fields
      data.time = data.time||{}
      data.time.ship = data.time.ship||{}
      return {item: data}
    }
    render(){
        const {item, err} = this.state
        if (!item)
            return <span>Not found</span>
        const setConf = conf=>this.setState({item: conf})
        return <RB.Container>
          {err && <RB.Row><RB.Col><ErrorMessage field={err} /></RB.Col></RB.Row>}
          <RB.Row className='menu-input-row'>
            <RB.Col>{L('config_setup')}</RB.Col>
            <RB.Col sm={3}><RB.Button onClick={()=>this.onSubmit()}>
              {LR('act_save')}
            </RB.Button></RB.Col>
          </RB.Row>
          <RB.Row className='menu-input-row'>
            <RB.Col>{L('config_setup_pace')}</RB.Col>
          </RB.Row>
          <GamePaceChange conf={item} onChange={setConf} />
          <RB.Row className='menu-input-row'>
            <RB.Col>{L('config_setup_points')}</RB.Col>
          </RB.Row>
          {PatentConfigChange(item, setConf)}
          <RB.Row className='menu-input-row'>
            <RB.Col>{L('points.order')}</RB.Col>
          </RB.Row>
          <OrderSpecialityChange conf={item} onChange={setConf} />
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
        <Delimeter />,
        <RB.Row>
          <ConfigControl />
        </RB.Row>
        ]
    }
}