import React from 'react'
import * as RB from 'react-bootstrap'
import {Item, ItemType, Resource, ResourceType, User} from '../common/entity'
import {List as UList} from '../util/controls'
import {Select as USelect} from '../util/select'
import {ItemRow, ItemRowDesc} from '../util/Item'
import {default as L, LR} from './locale'
import * as util from '../common/util'
import {ClientError} from '../common/errors'

type ListState = {

}
type ListProps = {
    user: User
}

export function ListNavigator(props: {user: User}){
    const {user} = props
    return <List user={user} />
}

class OwnerSelect extends USelect<{}, {}> {
    L = LR
    get fetchUrl(){ return '/api/corp/list' }
    getOptions(list: Item[]){
        return list.reduce((p, v)=>Object.assign(p, {[v._id]: v.name}), {})
    }
}

class PlanetSelect extends USelect<{}, {}> {
    L = LR
    get fetchUrl(){ return '/api/planet/list' }
    getOptions(list: Item[]){
        return list?.reduce((p, v)=>Object.assign(p, {[v._id]: v.name}), {}) || []
    }
}

function ResourceInput(props: {onCreate: (item: Item)=>void}){
    const [type, setType] = React.useState(-1)
    const onTypeChange = ({target: {value}})=>setType(+value)
    const typeOptions = Object.keys(ItemType).filter(k=>
        !isNaN(+k) && +k!=ItemType.Ship).map(k=>
        <option key={`item_type_${k}`} value={+k}>{LR(`item_type_${k}`)}</option>)
    typeOptions.unshift(<option key='item_type_none' value={-1}
        disabled={true}>{LR('item_desc_type')}</option>)
    const [kind, setKind] = React.useState(-1)
    const onResTypeChange = ({target: {value}})=>setKind(+value)
    const resTypeOptions = Object.keys(ResourceType).filter(k=>!isNaN(+k)).map(k=>
        <option key={`resource_type_${k}`}  value={+k}>{LR(`resource_${k}`)}</option>)
    resTypeOptions.unshift(<option key='res_type_none' value={-1}
        disabled={true}>{LR('res_desc_type')}</option>)
    const [volume, setVolume] = React.useState(null)
    const onVolumeChange = ({target: {value}})=>setVolume(+value)
    const [price, setPrice] = React.useState(null)
    const onPriceChange = ({target: {value}})=>setPrice(+value)
    const [owner, setOwner] = React.useState('')
    const [location, setLocation] = React.useState(null)
    const [coord, setCoord] = React.useState('')
    const onCoordChange = ({target: value})=>setCoord(value)
    const onCreate = ()=>{
        const pos = coord?.split(':')
        const loc = pos?.length!=2 ? null : {name: '', system: '',
            _id: location, pos: {col: +pos[0], row: +pos[1]}}
        const data = {type, kind, volume, price, name: '',
            owner: owner && {_id: owner, name: ''}, location: loc}
        props.onCreate(data as Item)
    }
    return <RB.InputGroup><RB.Row className='menu-list-row'>
      <RB.Col>{L('res_create')}</RB.Col>
      <RB.Col>
        <RB.FormSelect value={type} onChange={onTypeChange}>
          {typeOptions}
        </RB.FormSelect>
      </RB.Col>
      { type==ItemType.Resource && <RB.Col>
        <RB.FormSelect value={kind} onChange={onResTypeChange}>
          {resTypeOptions}
        </RB.FormSelect>
      </RB.Col>}
      <RB.Col>
        <RB.FormControl placeholder={LR('res_desc_volume')} value={volume} onChange={onVolumeChange} />
      </RB.Col>
      <RB.Col>
        <RB.FormControl placeholder={LR('res_desc_price')} value={price} onChange={onPriceChange} />
      </RB.Col>
      <RB.Col>
        <RB.Button onClick={onCreate}>{LR('res_btn_create')}</RB.Button>
      </RB.Col>
    </RB.Row>
    <RB.Row className='menu-list-row'>
      <RB.Col></RB.Col>
      <RB.Col>
        <OwnerSelect value={owner} onChange={setOwner} optName='item_owner' />
      </RB.Col>
      <RB.Col>
        <PlanetSelect value={location} onChange={setLocation}
            optName='item_location' />
      </RB.Col>
      <RB.Col>
        <RB.FormControl placeholder={LR('loc_desc_coord')} value={coord}
            onChange={onCoordChange} />
      </RB.Col>
    </RB.Row></RB.InputGroup>
}

class List extends UList<ListProps, ListState> {
    L = L
    get fetchUrl() { return `/api/admin/items/` }
    async createItem(item: Item){
        let data
        try { data = this[`check_item_${item.type}`](item) }
        catch (err){
            return this.setState({err: new ClientError(`not implemented: ${err}`)})
        }
        const res = await util.wget('/api/item/create', {method: 'POST', data})
        if (res.err)
            return void this.setState({err: res.err})
        this.fetch()
    }
    // Resource
    check_item_0(item: Item){
        const res = new Resource()
        for (let k of Object.keys(Resource))
            res[k] = item[k]
        return res
    }
    newResource(){
        return <RB.Container>
          <ResourceInput onCreate={(item: Item)=>this.createItem(item)} />
        </RB.Container>
    }
    body(){
        const {list} = this.state
        const rows = list.map(l=><ItemRow key={`item_list_${l._id}`} item={l} />)
        return [this.newResource(),
          <ItemRowDesc className='menu-list-title' />,
          ...rows]
    }
}