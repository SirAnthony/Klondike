import React from 'react'
import * as RB from 'react-bootstrap'
import {Corporation, User, Item, Patent} from '../common/entity'
import {Owner, InstitutionType, Loan, Order} from '../common/entity'
import {List as UList} from '../util/controls'
import {Select as USelect} from '../util/select'
import {default as L, LR} from './locale'
import {EntityRowEdit, InstitutionSave} from './RowEdit'
import {DataViewerButtons} from '../util/buttons'
import * as curls from '../common/urls'
import * as util from '../common/util'

function CorpRow(props: {entity: Corporation, onChange: (entity: InstitutionSave)=>Promise<boolean>}) {
    const {entity} = props
    const [showData, setShowData] = React.useState(false)
    const [showEdit, setShowEdit] = React.useState(false)
    const onChange = async entity=>(await props.onChange(entity)) && setShowEdit(false)
    if (showEdit)
        return <EntityRowEdit {...props} onChange={onChange} onCancel={()=>setShowEdit(false)} />
    return <RB.Row className="menu-list-row">
      <RB.Container><RB.Row>
        <RB.Col><img src={curls.Images.get(entity)} /></RB.Col>
        <RB.Col>{entity.name}</RB.Col>
        <RB.Col>{entity.credit}</RB.Col>
        <RB.Col>
          <RB.NavLink href={`/inventory/${entity.type}/${entity._id}`}>{LR('inventory')}</RB.NavLink>
        </RB.Col>
        <DataViewerButtons onEdit={setShowEdit} onShow={setShowData} show={showData} />
      </RB.Row>
      {showData && <RB.Row>
        <RB.Col>
          {entity.data}
        </RB.Col>
      </RB.Row>}
      </RB.Container>
    </RB.Row>
}

type CorpListState = {
    list?: Corporation[]
    newForm?: InstitutionSave
}
type CorpListProps = {
    user: User
}
export default class List extends UList<CorpListProps, CorpListState> {
    L = L
    get fetchUrl() { return `/api/admin/entity/list` }
    async changeEntity(entity: InstitutionSave) : Promise<boolean> {
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
        const rows = list.map(l=><CorpRow key={`corp_list_${l._id}`}
            entity={l} onChange={e=>this.changeEntity(e)} />)
        return [<EntityRowEdit add={true} onChange={e=>this.changeEntity(e)} entity={newForm} />,
        <RB.Row key={'corp_list_title'} className="menu-list-title">
          <RB.Col></RB.Col>
          <RB.Col>{LR('item_desc_name')}</RB.Col>
          <RB.Col>{LR('balance')}</RB.Col>
          <RB.Col>{LR('item_desc_data')}</RB.Col>
          <RB.Col>{LR('item_desc_actions')}</RB.Col>
        </RB.Row>, ...rows]
    }
}

export class Select extends USelect<{type: InstitutionType}, {}> {
    L = LR
    get optName(){ return 'item_desc_owner' }
    get fetchUrl(){ return `/api/corp/list/${this.props.type}` }
    get canFetch(){ return !isNaN(+this.props.type) }
    getValue(v){ 
        return v===this.defaultValue ? null : this.state.list.find(f=>f._id==v) }
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
    owner: Owner
}
export class PatentSelect extends USelect<PatentSelectProps, {}> {
    L = LR
    get optName(){ return 'item_desc_name' }
    get fetchUrl(){
        const {owner} = this.props
        return `/api/inventory/${owner?.type}/${owner?._id}/patents`
    }
    get canFetch(){ return !!this.props.owner?._id }
    getValue(v){ return this.state.list.find(f=>f._id==v) }
    getOptions(list: Patent[]){
        return list?.filter(this.props.filter||Boolean)
            .reduce((p, v)=>Object.assign(p, {[v._id]: v}), {}) || []
    }
}

type LoanSelectProps = {
    owner: Owner
}
export class LoanSelect extends USelect<LoanSelectProps, {}>{
    L = LR
    get optName(){ return 'suitable_loans' }
    get fetchUrl(){
        const {owner} = this.props
        return `/api/inventory/${owner?.type}/${owner?._id}/loans`
    }
    get canFetch(){ return !isNaN(+this.props.owner.type) }
    getValue(v){ return this.state.list.find(f=>f._id==v) }
    getOptionValue(opt: Loan) : String { 
        return `${opt.lender.name}: ${opt.amount}` }
    getOptions(list: Loan[]){
        return list?.filter(this.props.filter||Boolean)
            .reduce((p, v)=>Object.assign(p, {[v._id]: v}), {}) || []
    }
}

type OrderSelectProps = {
    owner: Owner
}
export class OrderSelect extends USelect<OrderSelectProps, {}> {
    L = LR
    get optName(){ return 'item_desc_type' }
    get fetchUrl(){
        const {owner} = this.props
        return `/api/inventory/${owner?.type}/${owner?._id}/orders`
    }
    get canFetch(){ return !!this.props.owner?._id }
    getValue(v){ return this.state.list.find(f=>f._id==v) }
    getOptionValue(opt: Order) : String {
        return opt.resourceCost.map(c=>
            `${LR(`res_kind_${c.kind}`)}: ${c.value|0}`).join('; ')
    }
    getOptions(list: Order[]){
        return list?.filter(this.props.filter||Boolean)
            .reduce((p, v)=>Object.assign(p, {[v._id]: v}), {}) || []
    }
}
