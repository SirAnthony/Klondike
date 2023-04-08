import React from 'react'
import * as RB from 'react-bootstrap'
import {Order, User} from '../common/entity'
import {List as UList} from '../util/controls'
import {Delimeter} from '../util/components'
import {OrderRow, OrderRowDesc, OrderRowNew} from '../util/Order'
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

class List extends UList<ListProps, ListState> {
    L = L
    get fetchUrl() { return `/api/admin/orders/` }
    get containerClass() { return 'menu-container-full' }
    async createItem(item: Order){
        let data = new item.class()
        for (let k of data.keys)
            data[k] = item[k]
        const res = await util.wget('/api/admin/order/create',
            {method: 'POST', data: {data}})
        if (res.err)
            return void this.setState({err: res.err})
        this.setState({err: null})
        this.fetch()
    }
    async deleteItem(item: Order){
        const res = await util.wget(`/api/admin/order/${item._id}/delete`,
            {method: 'DELETE'})
        if (res.err)
            return void this.setState({err: res.err})
        this.setState({err: null})
        this.fetch()
    }
    body(){
        const {list} = this.state
        const rows = list.map(l=><OrderRow order={l} className='menu-list-row'
            onDelete={o=>this.deleteItem(o)} onReload={()=>this.fetch()}
            key={`order_list_${l._id}`} {...this.props} />)
        return [<OrderRowNew onCreate={o=>this.createItem(o)} className='menu-list-row' />,
          <Delimeter />, <OrderRowDesc className='menu-list-title' />, <Delimeter />, 
          ...rows]
    }
}