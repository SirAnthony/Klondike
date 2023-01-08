import React from 'react'
import * as RB from 'react-bootstrap'
import {Corporation, User} from '../common/entity'
import * as F from '../Fetcher'
import * as util from '../common/util'
import {ControlBar} from '../util/controls'
import L from './locale'

function ShipRow(params: {corp: Corporation}) {
    const {corp} = params
    return <RB.Row className="menu-list-row">
      <RB.Col><img src={`/static/corp/${corp._id}.png`} /></RB.Col>
      <RB.Col><RB.NavLink href={`/corp/${corp._id}`}>{corp.name}</RB.NavLink></RB.Col>
    </RB.Row>
}

type ShipListState = {
    list?: Corporation[]
}
type ShipListProps = {
    user: User
}
export default class List extends F.Fetcher<ShipListProps, ShipListState> {
    constructor(props){
        super(props)
        this.state = {}
    }
    get fetchUrl() { return `/api/corps/` }
    fetchState(data: any){
        const {list} = data
        return {item: data, list}
    }
    render(){
        const {list} = this.state
        if (!list)
            return <div>{L('not_found')}</div>
        const rows = list.map(l=><ShipRow key={`corp_list_${l._id}`} corp={l} />)
        return <RB.Container className="menu-container">
          <ControlBar title={L('listing')} />
          <RB.Row key={'corp_list_title'} className="menu-list-title">
            <RB.Col></RB.Col>
            <RB.Col>{L('desc_name')}</RB.Col>
          </RB.Row>
          {rows}
        </RB.Container>
    }
}

