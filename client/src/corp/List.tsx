import React from 'react'
import * as RB from 'react-bootstrap'
import {Corporation, User, Item, Patent, InstitutionType} from '../common/entity'
import {List as UList} from '../util/controls'
import {Select as USelect} from '../util/select'
import {default as L, LR} from './locale'

function CorpRow(params: {corp: Corporation}) {
    const {corp} = params
    const url = corp.type==InstitutionType.Ship ? 'ship' :
        corp.type==InstitutionType.Organization ? 'org' :
        corp.type==InstitutionType.Research ? 'lab' :
        corp.type==InstitutionType.User ? 'user' : 'corp'
    return <RB.Row className="menu-list-row">
      <RB.Col><img src={`/static/corp/${corp._id}.png`} /></RB.Col>
      <RB.Col>{corp.name}</RB.Col>
      <RB.Col>{corp.credit}</RB.Col>
      <RB.Col><RB.NavLink href={`/inventory/${corp.type}/${corp._id}`}>{LR('inventory')}</RB.NavLink></RB.Col>
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
    get fetchUrl() { return `/api/corp/list` }
    body(){
        const {list} = this.state
        const rows = list.map(l=><CorpRow key={`corp_list_${l._id}`} corp={l} />)
        return [<RB.Row key={'corp_list_title'} className="menu-list-title">
          <RB.Col></RB.Col>
          <RB.Col>{LR('item_desc_name')}</RB.Col>
          <RB.Col>{LR('balance')}</RB.Col>
          <RB.Col>{LR('item_desc_data')}</RB.Col>
        </RB.Row>, ...rows]
    }
}

export class Select extends USelect<{type: InstitutionType}, {}> {
    L = LR
    get optName(){ return 'item_desc_owner' }
    get fetchUrl(){ return '/api/corp/list' }
    get fetchOpt(){ return {params: {type: this.props.type}} }
    getValue(v){ return this.state.list.find(f=>f._id==v) }
    getOptions(list: Item[]){
        return list?.filter(this.props.filter||Boolean)
            .reduce((p, v)=>Object.assign(p, {[v._id]: v}), {}) || []
    }
    componentDidUpdate(prevProps){
        if (prevProps.type!=this.props.type)
            this.fetch()
    }
}

type PatentSelectProps = {
    corp: Corporation
}
export class PatentSelect extends USelect<PatentSelectProps, {}> {
    L = LR
    get optName(){ return 'item_desc_name' }
    get fetchUrl(){
        return `/api/corp/patents/${this.props.corp?._id}` }
    getValue(v){ return this.state.list.find(f=>f._id==v) }
    getOptions(list: Patent[]){
        return list?.filter(this.props.filter||Boolean)
            .reduce((p, v)=>Object.assign(p, {[v._id]: v}), {}) || []
    }
}
