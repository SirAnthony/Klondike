import React from 'react'
import * as RB from 'react-bootstrap'
import {Planet, User} from '../common/entity'
import * as F from '../Fetcher'
import {List as UList} from '../util/controls'
import {ErrorMessage} from '../util/errors'
import * as util from '../common/util'
import L from './locale'

function PlanetRow(params: {planet: Planet}) {
    const {planet} = params
    const resources = planet.resources.map(f=>
        `${L('res_'+f.type)}: ${f.amount}`+(f.owner ? `(${util.get_name(f.owner)})` : '')).join(', ')
    const ships = planet.ships.map(f=>
        <RB.NavLink href={`/ship/${f._id}`}>{util.get_name(f)}</RB.NavLink>)
    return <RB.Row className="menu-list-row">
      <RB.Col><RB.NavLink href={`/map/${planet._id}`}>{planet.name}</RB.NavLink></RB.Col>
      <RB.Col>{L('desc_zones')+`: ${planet.zones.length}`}</RB.Col>
      <RB.Col>{resources}</RB.Col>
      <RB.Col>{ships}</RB.Col>
    </RB.Row>
}

type PlanetListState = {
    list?: Planet[]
}
type PlanetListProps = {
    user: User
}
export default class List extends UList<PlanetListProps, PlanetListState> {
    L = L
    constructor(props){
        super(props)
    }
    get fetchUrl() { return `/api/planets/` }
    body(){
        const {list} = this.state
        const rows = list.map(l=><PlanetRow key={`planet_list_${l._id}`} planet={l} />)
        return [<RB.Row key={'planet_list_title'} className="menu-list-title">
          <RB.Col>{L('desc_name')}</RB.Col>
          <RB.Col>{L('desc_info')}</RB.Col>
          <RB.Col>{L('desc_resources')}</RB.Col>
          <RB.Col>{L('desc_ships')}</RB.Col>
        </RB.Row>, ...rows] 
    }
}
