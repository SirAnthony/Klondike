import React from 'react'
import * as RB from 'react-bootstrap'
import {Corporation, User} from '../common/entity'
import {List as UList} from '../util/controls'
import {ErrorMessage} from '../util/errors'
import L from './locale'

function CorpRow(params: {corp: Corporation}) {
    const {corp} = params
    return <RB.Row className="menu-list-row">
      <RB.Col><img src={`/static/corp/${corp._id}.png`} /></RB.Col>
      <RB.Col><RB.NavLink href={`/corp/${corp._id}`}>{corp.name}</RB.NavLink></RB.Col>
    </RB.Row>
}

type CorpListState = {
    list?: Corporation[]
}
type CorpListProps = {
    user: User
}
export default class List extends UList<CorpListProps, CorpListState> {
    L = L
    get fetchUrl() { return `/api/corp/` }
    body(){
        const {list} = this.state
        const rows = list.map(l=><CorpRow key={`corp_list_${l._id}`} corp={l} />)
        return [<RB.Row key={'corp_list_title'} className="menu-list-title">
          <RB.Col></RB.Col>
          <RB.Col>{L('desc_name')}</RB.Col>
        </RB.Row>, ...rows]
    }
}