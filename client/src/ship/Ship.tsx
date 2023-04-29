import React from 'react'
import * as RB from 'react-bootstrap'
import {Ship, ShipValues} from '../common/entity'
import {ModuleDetails} from './Module'
import * as util from '../common/util'
import L from './locale'

type ShipProps = {
    ship: Ship
}

function Description(props: ShipProps){
    const ship: Ship = props.ship
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
    const ship: Ship = props.ship
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
          <ModuleDetails {...props} />
        </RB.Col>
      </RB.Row>
    </RB.Container>
}

function ShipControls(props: ShipProps){
    return <RB.Container>
      <RB.Row><RB.Col>
        <img src={`/static/img/ships/${props.ship.img}.png`} alt="ship" />
      </RB.Col></RB.Row>
      <RB.Row><RB.Col>
        <RB.Button>{L('install_module')}</RB.Button>
      </RB.Col></RB.Row>
      <RB.Row><RB.Col>
        <RB.Button>{L('repair')}</RB.Button>
      </RB.Col></RB.Row>
    </RB.Container>
}

export function ShipDesc(props: ShipProps){
    return <RB.Row>
      <RB.Col className="menu-box-clear" sm={3}>
        <ShipControls {...props} />
      </RB.Col>
      <RB.Col sm={9}><ShipInfo {...props} /></RB.Col>
    </RB.Row>
}