import React from 'react'
import {Order, User} from '../common/entity'
import {List as UList} from '../util/controls'
import {Delimeter} from '../util/components'
import {OrderRow, OrderRowDesc, OrderRowNew, OrderSend} from '../inventory/Order'
import {default as L} from './locale'
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
    async onSubmit(item: OrderSend){
        this.setState({err: null})
        const data = util.obj_copyto(item, new Order())
        const res = await util.wget(`/api/admin/order/${item._id||0}/set`,
            {method: 'POST', data: {data}})
        if (res.err)
            return void this.setState({err: res.err})
        this.fetch()
        return true
    }
    async deleteItem(item: Order){
        const res = await util.wget(`/api/admin/order/${item._id}/delete`,
            {method: 'DELETE'})
        if (res.err)
            return void this.setState({err: res.err})
        this.setState({err: null})
        this.fetch()
        return true
    }
    body(){
        const {list} = this.state
        const rows = list.map(l=><OrderRow order={l} className='menu-list-row'
            onSubmit={o=>this.onSubmit(o)} onDelete={o=>this.deleteItem(o)}
            onReload={()=>this.fetch()} key={`order_list_${l._id}`} {...this.props} />)
        return [<OrderRowNew onSubmit={o=>this.onSubmit(o)} add={true} />,
          <Delimeter />, <OrderRowDesc className='menu-list-title' />, <Delimeter />, 
          ...rows]
    }
}