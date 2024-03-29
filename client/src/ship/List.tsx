import React from 'react'
import * as RB from 'react-bootstrap'
import {Module, Owner, Ship, User} from '../common/entity'
import * as util from '../common/util'
import {List as UList} from '../util/controls'
import {ShipRowEdit, ShipSend} from './RowEdit'
import {Select as USelect} from '../util/select'
import {default as L, LR} from './locale'
import * as urls from '../common/urls'

function ShipRow(props: {entity: Ship, onChange: (ship: Ship)=>Promise<boolean>}) {
    const {entity} = props
    const [showData, setShowData] = React.useState(false)
    const [showEdit, setShowEdit] = React.useState(false)
    const onChange = async entity=>(await props.onChange(entity)) && setShowEdit(false)
    if (showEdit)
        return <ShipRowEdit {...props} onChange={onChange} onCancel={()=>setShowEdit(false)} />
    return <RB.Row className="menu-list-row">
      <RB.Col><img src={urls.Images.get(entity)} /></RB.Col>
      <RB.Col><RB.NavLink href={urls.Links.ship(entity)}>{entity.name}</RB.NavLink></RB.Col>
      <RB.Col><RB.NavLink href={urls.Links.profile(entity.owner)} >
        {LR(`institution_type_${entity.owner?.type}`)+' '+util.get_name(entity.owner)}
      </RB.NavLink></RB.Col>
      <RB.Col><RB.NavLink href={urls.Links.profile(entity.captain)}>{util.get_name(entity.captain)}</RB.NavLink></RB.Col>
      <RB.Col>{entity.credit}</RB.Col>
      <RB.Col><RB.NavLink href={urls.Links.inventory(entity)}>{LR('inventory')}</RB.NavLink></RB.Col>
      <RB.Col>
        <RB.Button onClick={()=>setShowData(!showData)}>{LR('act_show_data')}</RB.Button>
        <RB.Button onClick={()=>setShowEdit(true)}>{LR('act_edit')}</RB.Button>
      </RB.Col>
    </RB.Row>
}

type ShipListState = {
    list?: Ship[]
    newForm?: ShipSend
}
type ShipListProps = {
    user: User
}
export default class List extends UList<ShipListProps, ShipListState> {
    L = L
    get fetchUrl() { return `/api/ship/list` }
    async changeEntity(entity: ShipSend) : Promise<boolean> {
        this.setState({err: null, newForm: null})
        const ret = await util.wget(`/api/admin/entity/${entity.type}/${entity._id||0}/set`,
            {method: 'POST', data: util.toFormData(entity, 'imgFile')})
        if (ret.err)
            return void this.setState({err: ret.err, newForm: entity})
        this.fetch()
        return true  
    }
    body(){
        const {list, newForm} = this.state
        const rows = list.map(l=><ShipRow key={`ship_list_${l._id}`} entity={l}
            onChange={e=>this.changeEntity(e)} />)
        return [<ShipRowEdit add={true} onChange={e=>this.changeEntity(e)} entity={newForm} />,
        <RB.Row key={'ship_list_title'} className="menu-list-title">
            <RB.Col></RB.Col>
            <RB.Col>{LR('item_desc_name')}</RB.Col>
            <RB.Col>{LR('item_desc_owner')}</RB.Col>
            <RB.Col>{L('desc_captain')}</RB.Col>
            <RB.Col>{L('desc_balance')}</RB.Col>
            <RB.Col>{LR('item_desc_data')}</RB.Col>
            <RB.Col>{LR('item_desc_actions')}</RB.Col>
        </RB.Row>, ...rows]
    }
}

type ModuleSelectProps = {
    owner: Owner
}
export class ModuleSelect extends USelect<ModuleSelectProps, {}> {
    L = LR
    get optName(){ return 'item_desc_name' }
    get fetchUrl(){
        const {owner} = this.props
        return `/api/ship/${owner?._id}/modules`
    }
    get canFetch(){ return !!this.props.owner?._id }
    getValue(v){ return this.state.list.find(f=>f._id==v) }
    getOptions(list: Module[]){
        return list?.filter(this.props.filter||Boolean)
            .reduce((p, v)=>Object.assign(p, {[v._id]: v}), {}) || []
    }
}
