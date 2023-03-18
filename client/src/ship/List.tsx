import React from 'react'
import * as RB from 'react-bootstrap'
import {Ship as EShip, User} from '../common/entity'
import * as util from '../common/util'
import {List as UList} from '../util/controls'
import {ErrorMessage} from '../util/errors'
import L from './locale'

function ShipRow(params: {ship: EShip}) {
    const {ship} = params
    return <RB.Row className="menu-list-row">
      <RB.Col><img src={`/static/img/ships/${ship.img}.png`} /></RB.Col>
      <RB.Col><RB.NavLink href={`/ship/${ship._id}`}>{ship.name}</RB.NavLink></RB.Col>
      <RB.Col><RB.NavLink href={`/corp/${ship.owner._id}`}>{util.get_name(ship.owner)}</RB.NavLink></RB.Col>
      <RB.Col><RB.NavLink href={`/user/${ship.captain._id}`}>{util.get_name(ship.captain)}</RB.NavLink></RB.Col>
    </RB.Row>
}

type ShipListState = {
    list?: EShip[]
}
type ShipListProps = {
    user: User
}
export default class List extends UList<ShipListProps, ShipListState> {
    L = L
    get fetchUrl() { return `/api/ship/list` }
    body(){
        const {list} = this.state
        const rows = list.map(l=><ShipRow key={`ship_list_${l._id}`} ship={l} />)
        return [<RB.Row key={'ship_list_title'} className="menu-list-title">
            <RB.Col></RB.Col>
            <RB.Col>{L('desc_name')}</RB.Col>
            <RB.Col>{L('desc_owner')}</RB.Col>
            <RB.Col>{L('desc_captain')}</RB.Col>
        </RB.Row>, ...rows]
    }
}