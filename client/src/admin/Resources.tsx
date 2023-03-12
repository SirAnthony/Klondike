import React from 'react'
import * as RB from 'react-bootstrap'
import {Item, ItemType, MarketType, Resource, ResourceType, User} from '../common/entity'
import {List as UList} from '../util/controls'
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
    const onCreate = ()=>{
        const data = {type, kind, volume, price, name: '',
         market: {type: MarketType.None}, owner: null, location: null}
        props.onCreate(data as Item)
    }
    return <RB.InputGroup>
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
    </RB.InputGroup>
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
          <RB.Row className='menu-list-row'>
            <ResourceInput onCreate={(item: Item)=>this.createItem(item)} />
          </RB.Row>
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