import React from 'react'
import * as RB from 'react-bootstrap'
import {Item, ItemType, ResourceType, User} from '../common/entity'
import {List as UList} from '../util/controls'
import {Select as USelect} from '../util/select'
import {ItemRow, ItemRowDesc} from '../util/Item'
import {default as L, LR} from './locale'
import * as util from '../common/util'


type ListState = {

}
type ListProps = {
    user: User
}

export function ListNavigator(props: {user: User}){
    const {user} = props
    return <List user={user} />
}

function OrderInput(props: {onCreate: (item: Item)=>void}){
    return <RB.Row></RB.Row>
}

class List extends UList<ListProps, ListState> {
    L = L
    get fetchUrl() { return `/api/admin/items/` }
    get containerClass() { return 'menu-container-full' }
    async createItem(item: Item){
        let data = new item.class()
        for (let k of data.keys)
            data[k] = item[k]
        const res = await util.wget('/api/admin/order/create', {method: 'POST',
            data: {data}})
        if (res.err)
            return void this.setState({err: res.err})
        this.setState({err: null})
        this.fetch()
    }
    newOrder(){
        return <RB.Container>
          <OrderInput onCreate={(item: Item)=>this.createItem(item)} />
        </RB.Container>
    }
    body(){
        const {list} = this.state
        const fields = ['kind', 'owner', 'location', 'data']
        const rows = list.map(l=><ItemRow className='menu-list-row' onReload={()=>this.fetch()}
          key={`item_list_${l._id}`} item={l} fields={fields} user={this.props.user} />)
        return [this.newOrder(),
          <ItemRowDesc className='menu-list-title' fields={fields} user={this.props.user} />,
          ...rows]
    }
}