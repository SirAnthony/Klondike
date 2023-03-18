import React from 'react'
import * as RB from 'react-bootstrap'
import {Item, ItemType, Resource, ResourceType, User} from '../common/entity'
import {List as UList} from '../util/controls'
import {Select as USelect} from '../util/select'
import {ItemRow, ItemRowDesc, ResourceSelect} from '../util/Item'
import {Select as CSelect} from '../corp/List'
import {Select as PSelect} from '../map/List'
import {default as L, LR} from './locale'
import * as util from '../common/util'

type ListState = {
    resources: Resource[]
}
type ListProps = {
    user: User
}

export function ListNavigator(props: {user: User}){
    const {user} = props
    return <List user={user} />
}

function ItemInput(props: {onCreate: (item: Item)=>void}){
    const [type, setType] = React.useState(-1)
    const onTypeChange = ({target: {value}})=>setType(+value)
    const typeOptions = Object.keys(ItemType).filter(k=>
        !isNaN(+k) && +k!=ItemType.Ship).map(k=>
        <option key={`item_type_${k}`} value={+k}>{LR(`item_type_${k}`)}</option>)
    typeOptions.unshift(<option key='item_type_none' value={-1}
        disabled={true}>{LR('item_desc_type')}</option>)
    const [kind, setKind] = React.useState(-1)
    const [value, setValue] = React.useState(undefined)
    const onValueChange = ({target: {value}})=>setValue(+value)
    const [price, setPrice] = React.useState(undefined)
    const onPriceChange = ({target: {value}})=>setPrice(+value)
    const [owner, setOwner] = React.useState('')
    const [location, setLocation] = React.useState('')
    const [coord, setCoord] = React.useState('')
    const onCoordChange = ({target: {value}})=>setCoord(value)
    const [textData, setTextData] = React.useState('')
    const onTextDataChange = ({target: {value}})=>setTextData(value)
    const onCreate = ()=>{
        const item = new Item()
        Object.assign(item, {type, kind, volume: value, price, name: '',
            owner: owner && {_id: owner, name: ''}, data: textData})
        const pos = coord?.split(':')
        item.location = pos?.length!=2 ? null : {name: '', system: '',
            _id: location, pos: {col: +pos[0], row: +pos[1]}}
        props.onCreate(item)
    }
    const row_size = type==ItemType.Resource ? 2 : 3
    return <RB.InputGroup><RB.Row className='menu-list-row'>
      <RB.Col sm={row_size}>{L('item_create')}</RB.Col>
      <RB.Col sm={row_size}>
        <RB.FormSelect value={type} onChange={onTypeChange}>
          {typeOptions}
        </RB.FormSelect>
      </RB.Col>
      { type==ItemType.Resource && <RB.Col sm={row_size}>
        <ResourceSelect value={kind} onChange={(type)=>setKind(type)} />
      </RB.Col>}
      { type==ItemType.Resource && <RB.Col sm={row_size}>
        <RB.FormControl placeholder={LR('res_desc_value')} value={value} onChange={onValueChange} />
      </RB.Col>}
      <RB.Col sm={row_size}>
        <RB.FormControl placeholder={LR('item_desc_price')} value={price} onChange={onPriceChange} />
      </RB.Col>
      <RB.Col sm={row_size}>
        <RB.Button onClick={onCreate}>{LR('act_create')}</RB.Button>
      </RB.Col>
    </RB.Row>
    <RB.Row className='menu-list-row'>
      <RB.Col sm={4}>
        <RB.FormControl as='textarea' rows={3} placeholder={LR('item_desc_data')}
          value={textData} onChange={onTextDataChange} />
      </RB.Col>
      <RB.Col sm={2}>
        <CSelect value={owner} onChange={setOwner} optName='item_desc_owner' />
      </RB.Col>
      <RB.Col sm={2}>
        <PSelect value={location} onChange={setLocation} optName='item_desc_location' />
      </RB.Col>
      <RB.Col sm={2}>
        <RB.FormControl placeholder={LR('loc_desc_coord')} value={coord}
            onChange={onCoordChange} />
      </RB.Col>
    </RB.Row></RB.InputGroup>
}

type ResourceFields = {_id: string, data: string, price: number}
function ResourceInput(props: {res: Resource, onChange: (res: ResourceFields)=>void}){
    const {res} = props
    const [textData, setTextData] = React.useState(res.data)
    const [price, setPrice] = React.useState(res.price)
    const onChange = ()=>props.onChange({_id: res._id, data: textData, price})
    return <RB.Row className='menu-list-row'><RB.InputGroup>
      <RB.Col>{LR(`res_kind_${res.kind}`)}</RB.Col>
      <RB.Col sm={1}>{LR('item_desc_price')}</RB.Col>
      <RB.Col>
        <RB.FormControl placeholder={LR('item_desc_price')} value={price}
          onChange={({target: {value}})=>setPrice(+value)} />
      </RB.Col>
      <RB.Col sm={1}>{LR('item_desc_data')}</RB.Col>
      <RB.Col>
        <RB.FormControl as='textarea' rows={1} placeholder={LR('item_desc_data')}
          value={textData} onChange={({target: {value}})=>setTextData(value)} />
      </RB.Col>
      <RB.Col>
        <RB.Button onClick={onChange}>{LR('act_change')}</RB.Button>
      </RB.Col>
    </RB.InputGroup></RB.Row>
}

class List extends UList<ListProps, ListState> {
    L = L
    get fetchUrl() { return `/api/admin/items/` }
    fetchState(data: any = {}){
        const {list, resources} = data
        return {item: data, list, resources}
    }
    get containerClass() { return 'menu-container-full' }
    async createItem(item: Item){
        let data = new item.class()
        for (let k of data.keys)
            data[k] = item[k]
        const res = await util.wget('/api/admin/item/create', {method: 'POST',
            data: {data}})
        if (res.err)
            return void this.setState({err: res.err})
        this.setState({err: null})
        this.fetch()
    }
    async changeResource(data: ResourceFields){
        const res = await util.wget(`/api/admin/resource/${data._id}`,
            {method: 'POST', data})
        if (res.err)
            return void this.setState({err: res.err})
        this.setState({err: null})
        this.fetch()
    }
    resources(){
        const rows = this.state.resources?.map(r=><ResourceInput res={r}
          onChange={(data)=>this.changeResource(data)} />)
        return <RB.Container>
            {rows}
        </RB.Container>
    }
    newItem(){
        return <RB.Container>
          <ItemInput onCreate={(item: Item)=>this.createItem(item)} />
        </RB.Container>
    }
    body(){
        const {list} = this.state
        const fields = ['kind', 'owner', 'location', 'data']
        const rows = list.map(l=><ItemRow className='menu-list-row' onReload={()=>this.fetch()}
          key={`item_list_${l._id}`} item={l} fields={fields} user={this.props.user} />)
        return [this.resources(), this.newItem(),
          <ItemRowDesc className='menu-list-title' fields={fields} user={this.props.user} />,
          ...rows]
    }
}