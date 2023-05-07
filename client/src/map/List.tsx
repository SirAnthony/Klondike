import React from 'react'
import * as RB from 'react-bootstrap'
import {PlanetInfo, User, Item, Planet} from '../common/entity'
import {List as UList} from '../util/controls'
import {Select as USelect} from '../util/select'
import {PlanetRowEdit} from './RowEdit'
import {DataViewerButtons} from '../util/buttons'
import * as util from '../common/util'
import {default as L, LR} from './locale'

function PlanetRow(props: {planet: PlanetInfo, onChange?: (entity: PlanetInfo)=>Promise<boolean>}) {
    const {planet} = props
    const [showData, setShowData] = React.useState(false)
    const [showEdit, setShowEdit] = React.useState(false)
    const onChange = async planet=>(await props.onChange(planet)) && setShowEdit(false)
    if (props.onChange && showEdit)
        return <PlanetRowEdit {...props} onChange={onChange} onCancel={()=>setShowEdit(false)} />
    const zones = showData ? planet.zones?.map(z=>
        <RB.Col>{`<${z.center.col}:${z.center.row}>(${z.radius})`}</RB.Col>) : null
    return <RB.Row className="menu-list-row">
      <RB.Container>
        <RB.Row>
          <RB.Col><RB.NavLink href={`/map/${planet._id}`}>{planet.name}</RB.NavLink></RB.Col>
          <RB.Col>{planet.type}</RB.Col>
          <RB.Col>{planet.system}</RB.Col>
          <DataViewerButtons onEdit={props.onChange && setShowEdit} onShow={setShowData} show={showData} />
        </RB.Row>
        {showData && <RB.Row>
          <RB.Col>
            {planet.data}
          </RB.Col>
        </RB.Row>}
      </RB.Container>
    </RB.Row>
}

type PlanetListState = {
    list?: Planet[]
    newForm?: Planet
}
type PlanetListProps = {
    user: User
}
export default class List extends UList<PlanetListProps, PlanetListState>{
    L = L
    constructor(props){
        super(props)
    }
    get fetchUrl() { return `/api/planet/list` }
    body(){
        const {list} = this.state
        const rows = list.map(l=><PlanetRow key={`planet_list_${l._id}`} planet={l} />)
        return [<RB.Row key={'planet_list_title'} className="menu-list-title">
          <RB.Col>{L('desc_name')}</RB.Col>
          <RB.Col>{L('desc_info')}</RB.Col>
          <RB.Col>{L('desc_system')}</RB.Col>
          <RB.Col></RB.Col>
        </RB.Row>, ...rows] 
    }
}

type PlanetListEditState = {
    newForm?: Planet
} & PlanetListState
export class EditList extends UList<PlanetListProps, PlanetListEditState> {
    L = L
    constructor(props){
        super(props)
    }
    get fetchUrl() { return `/api/admin/planet/list` }
    async changeEntity(planet: Planet, create?: boolean) : Promise<boolean> {
        this.setState({err: null, newForm: null})
        const ret = await util.wget(`/api/admin/planet/${planet._id||0}/set`,
            {method: 'POST', data: {data: planet}})
        if (ret.err)
            return void this.setState({err: ret.err, newForm: create ? planet : null})
        this.fetch()
        return true  
    }
    body(){
        const {list, newForm} = this.state
        const rows = list.map(l=><PlanetRow key={`planet_list_${l._id}`} planet={l}
            onChange={e=>this.changeEntity(e)} />)
        return [<PlanetRowEdit add={true} onChange={e=>this.changeEntity(e, true)} planet={newForm} />,
        <RB.Row key={'planet_list_title'} className="menu-list-title">
          <RB.Col>{L('desc_name')}</RB.Col>
          <RB.Col>{L('desc_info')}</RB.Col>
          <RB.Col>{L('desc_system')}</RB.Col>
          <RB.Col>{LR('item_desc_actions')}</RB.Col>
        </RB.Row>, ...rows] 
    }
}

export class Select extends USelect<{}, {}> {
    L = LR
    top_enabled = true
    get fetchUrl(){ return '/api/planet/list/short' }
    get optName(){ return 'item_desc_location' }
    getValue(v){
        return v==this.defaultValue ? null : this.state.list.find(f=>f._id==v) }
    getOptions(list: Item[]){
        return list?.reduce((p, v)=>Object.assign(p, {[v._id]: v}), {}) || []
    }
}
