import React from 'react'
import {LogEntry, User} from '../common/entity'
import {List as UList} from '../util/controls'
import {Delimeter} from '../util/components'
import {default as L} from './locale'
import * as util from '../common/util'
import {LogRow, LogRowDesc, LogRowNew} from '../site/Log'


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
    get fetchUrl() { return `/api/admin/logs` }
    get containerClass() { return 'menu-container-full' }
    async onSubmit(item: LogEntry){
        this.setState({err: null})
        const data = util.obj_copyto(item, new LogEntry())
        const res = await util.wget(`/api/admin/log/${item._id||0}/set`,
            {method: 'POST', data: {data}})
        if (res.err)
            return void this.setState({err: res.err})
        this.fetch()
        return true
    }
    async deleteItem(item: LogEntry){
        const res = await util.wget(`/api/admin/log/${item._id}/delete`,
            {method: 'DELETE'})
        if (res.err)
            return void this.setState({err: res.err})
        this.setState({err: null})
        this.fetch()
        return true
    }
    body(){
        const {list} = this.state
        const rows = list.map(l=><LogRow entry={l} className='menu-list-row'
            onSubmit={o=>this.onSubmit(o)} onDelete={o=>this.deleteItem(o)}
            onReload={()=>this.fetch()} key={`order_list_${l._id}`} {...this.props} />)
        return [<LogRowNew onSubmit={o=>this.onSubmit(o)} add={true} />,
          <Delimeter />, <LogRowDesc className='menu-list-title' />, <Delimeter />, 
          ...rows]
        return []
    }
}