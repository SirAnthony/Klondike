import React from 'react'
import * as RB from 'react-bootstrap'
import {Item, Resource, User} from '../common/entity'
import {List as UList} from '../util/controls'
import {ItemRow, ItemRowDesc, ItemRowNew} from '../util/Item'
import {default as L, LR} from './locale'
import * as util from '../common/util'
import {Delimeter} from '../util/components'

type ListState = {
    resources: Resource[]
    showResources: Boolean
}
type ListProps = {
    user: User
}

export function ListNavigator(props: {user: User}){
    const {user} = props
    return <List user={user} />
}


type ResourceFields = {_id: string, data: string, price: number}
function ResourceInput(props: {res: Resource, onChange: (res: ResourceFields)=>void}){
    const {res} = props
    const [textData, setTextData] = React.useState(res.data)
    const [price, setPrice] = React.useState(res.price)
    const onChange = ()=>props.onChange({_id: res._id, data: textData, price})
    return <RB.Row className='menu-input-row'><RB.InputGroup>
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
        const {showResources} = this.state
        const toggleResources = ()=>this.setState({showResources: !showResources})
        const rows = this.state.resources?.map(r=><ResourceInput res={r}
           key={`res_input_${r._id}`} onChange={(data)=>this.changeResource(data)} />)
        return <RB.Container key='resource_container'>
          <RB.Button onClick={toggleResources}>
            {L('res_show')+' '+(showResources ? '⇑' : '⇓')}
          </RB.Button>
          {showResources && rows}
        </RB.Container>
    }
    newItem(){
        return <RB.Container key='new_item_ctrl'>
          <ItemRowNew onCreate={(item: Item)=>this.createItem(item)} />
        </RB.Container>
    }
    body(){
        const {list} = this.state
        const fields = ['kind', 'owner', 'location', 'data']
        const rows = list.map(l=><ItemRow className='menu-list-row' onReload={()=>this.fetch()}
          key={`item_list_${l._id}`} item={l} fields={fields} user={this.props.user} />)
        return [
          this.resources(),
          <Delimeter key='res_delimeter' />,
          this.newItem(),
          <ItemRowDesc key='item_row_desc' className='menu-list-title'
            fields={fields} user={this.props.user} />,
          <Delimeter key='res_delimeter2' />,
          ...rows
        ]
    }
}