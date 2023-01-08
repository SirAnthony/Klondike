import React from 'react'
import * as RR from 'react-router-dom'
import * as RB from 'react-bootstrap'
import {Ship as EShip, Module as EModule, ShipValues} from '../common/entity'
import * as util from '../common/util'
import {ControlBar} from '../util/controls'
import L from './locale'

type ShipProps = {
    ship: EShip
}

function Mod(num: number, mod: EModule){
    if (!mod)
        return [<tr><td>{L('mod_empty')}</td><td></td><td></td></tr>]
    const values = ShipValues.mods.map(k=><tr>
      <td>{L('mod_stat', k)}</td>
      <td>{L('mod_stat_c', k)}</td>
      <td>{mod[k]}</td>
    </tr>).concat(mod.boosts.map(k=><tr>
      <td>{L('mod_stat', k.kind)}</td>
      <td>{L('mod_stat_c', k.kind)}</td>
      <td>{k.value}</td>
    </tr>))
    return [<tr>
      <td>{L('mod_slot')+' '+num}</td>
    </tr>,
    <tr>
      <td>{mod.name}</td>
    </tr>, ...values]
}

function Modules(props: ShipProps){
    const ship: EShip = props.ship
    const values = []
    for (let k=0; k<ship.slots; k++)
        values.push(Mod(k, ship.modules[k]))
    return <div className="menu-box"><table>
      <tr>
        <th colSpan={2}>{L('mod_title')}</th>
        <th>{L('mod_values')}</th>
      </tr>
      {values.flat()}
    </table></div>
}

function Description(props: ShipProps){
    const ship: EShip = props.ship
    const values = ShipValues.desc.map(k=><RB.Row>
      <RB.Col sm={5} className="menu-box-row-desc left">{L(`desc_${k}`)}</RB.Col>
      <RB.Col className="left">{util.get_name(ship[k])}</RB.Col>
    </RB.Row>)
    return <RB.Container className="menu-box">
      <RB.Row>
        <RB.Col className="menu-box-head">{L('description')}</RB.Col>
      </RB.Row>
      <RB.Row>
        <RB.Container>{values.flat()}</RB.Container>
      </RB.Row>
    </RB.Container>
}

function Stats(props: ShipProps){
    const ship: EShip = props.ship
    const values = ShipValues.stats.map(k=><tr>
      <td className="left">{L(`stat_${k}`)}</td>
      <td>{L(`stat_${k}_c`)}</td>
      <td>{ship[k]}</td>
    </tr>)
    return <div className="menu-box"><table>
      <tr>
        <th colSpan={2}>{L('stats_title')}</th>
        <th>{L('stats_values')}</th>
      </tr>
      {values}
    </table></div>
}

function ShipInfo(props: ShipProps){
    return <RB.Container>
      <RB.Row>
        <RB.Col className="menu-box-col-clear" sm={6}>
          <Stats {...props} />
          <Description {...props} />
        </RB.Col>
        <RB.Col className="menu-box-col-clear" sm={6}>
          <Modules {...props} />
        </RB.Col>
      </RB.Row>
    </RB.Container>
}

function ShipControls(props: ShipProps){
    return <RB.Container>
      <RB.Row><RB.Col>
        <img src={`/static/ships/${props.ship._id}.png`} alt="ship" />
      </RB.Col></RB.Row>
      <RB.Row><RB.Col>
        <RB.Button>{L('install_module')}</RB.Button>
      </RB.Col></RB.Row>
      <RB.Row><RB.Col>
        <RB.Button>{L('repair')}</RB.Button>
      </RB.Col></RB.Row>
    </RB.Container>
}

export default function Ship(props: ShipProps){
    const nav = RR.useNavigate()
    const close = ()=>nav('/')
    return (<RB.Container className="menu-container">
      <ControlBar title={L('interface')} />
      <RB.Row>
        <RB.Col className="menu-box-clear" sm={3}>
          <ShipControls {...props} />
        </RB.Col>
        <RB.Col sm={9}><ShipInfo {...props} /></RB.Col>
      </RB.Row>
    </RB.Container>)
}