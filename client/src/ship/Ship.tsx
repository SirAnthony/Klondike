import React from 'react'
import * as RB from 'react-bootstrap'
import {Module, Ship, ShipValues} from '../common/entity'
import {ModuleDetails} from './Module'
import * as util from '../common/util'
import * as urls from '../common/urls'
import {default as L, LR} from './locale'
import { ModuleSelectTrigger } from 'src/util/popovers'
import { ErrorMessage } from 'src/util/errors'
import { InventoryEvents } from 'src/inventory'

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
    const {ship} = props
    const [err, setErr] = React.useState(null)
    const flight_name = ship.flight?.name.split(' ').map(k=>LR(`flight_${k}`)).join('. ')
    const installModule = async (mod)=>{
        const {ship} = props
        setErr(null)
        const ret = await util.wget(`/api/ship/${ship._id}/module/${mod._id}/install`,
            {method: 'PUT'})
        if (ret.err)
            return void setErr(ret.err)
        InventoryEvents.reloadModules()
        return true
    }
    return <RB.Container>
      <RB.Row><RB.Col>
        <img src={urls.Images.get(ship)} alt="ship" />
      </RB.Col></RB.Row>
      {flight_name && <RB.Row>
        <RB.Col>{flight_name}</RB.Col>
      </RB.Row>}
      {err && <RB.Row><RB.Col><ErrorMessage field={err} /></RB.Col></RB.Row>}
      <RB.Row><RB.Col>
        <ModuleSelectTrigger owner={ship} desc={L('install_module')}
          onClick={installModule} />
      </RB.Col></RB.Row>
      {/*<RB.Row><RB.Col>
        <RB.Button>{L('repair')}</RB.Button>
      </RB.Col></RB.Row>*/}
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