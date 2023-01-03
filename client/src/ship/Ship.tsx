import React from 'react';
import * as RB from 'react-bootstrap'
import {Ship as EShip, Module as EModule, ShipValues} from '../common/entity'
import L from './locale'

type ShipProps = {
    ship: EShip
}

function Mod(num: number, mod: EModule){
    if (!mod)
        return [<tr><td>{L('mod_empty')}</td></tr>]
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
    return <table>
      <tr>
        <th colSpan={2}>{L('mod_title')}</th>
        <th>{L('mod_values')}</th>
      </tr>
      {values.flat()}
    </table>
}

function Description(props: ShipProps){
    const ship: EShip = props.ship
    const values = ShipValues.desc.map(k=>[
      <dt>{L(`desc_${k}`)}</dt>,
      <dd>{L(ship[k].name||ship[k])}</dd>
    ])
    return <div>
      <p>{L('description')}</p>
      <dl>{values.flat()}</dl>
    </div>
}

function Stats(props: ShipProps){
    const ship: EShip = props.ship
    const values = ShipValues.stats.map(k=><tr>
      <td>{L(k)}</td>
      <td>{L(`${k}_c`)}</td>
      <td>{ship[k]}</td>
    </tr>)
    return <table>
      <tr>
        <th colSpan={2}>{L('stats_title')}</th>
        <th>{L('stats_values')}</th>
      </tr>
      {values}
    </table>
}

function ShipInfo(props: ShipProps){
    return <RB.Container>
      <RB.Col>
        <RB.Row><Stats {...props} /></RB.Row>
        <RB.Row><Description {...props} /></RB.Row>
      </RB.Col>
      <RB.Col>
        <RB.Row><Modules {...props} /></RB.Row>
      </RB.Col>
    </RB.Container>
}

function ShipControls(props: ShipProps){
    return <RB.Container>
      <RB.Col></RB.Col>
      <RB.Col>{L('install_module')}</RB.Col>
      <RB.Col>{L('repair')}</RB.Col>
    </RB.Container>
}

export default function Ship(props: ShipProps){
    return (<RB.Container>
      <RB.Row>
        <RB.Col><ShipControls {...props} /></RB.Col>
        <RB.Col><ShipInfo {...props} /></RB.Col>
      </RB.Row>
    </RB.Container>)
}