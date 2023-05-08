import React from 'react'
import * as RB from 'react-bootstrap'
import {EventGroupType, EventGroups, LogEntry, User} from '../common/entity'
import {List as UList} from '../util/controls'
import {Delimeter} from '../util/components'
import {default as L} from './locale'
import * as util from '../common/util'
import {LogRow, LogRowDesc, LogRowNew} from '../site/Log'
import {LogActionMultiSelect} from '../util/inputs'
import * as date from '../common/date'


type ListState = {
    filter: EventGroupType[]
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
    sort(a: LogEntry, b: LogEntry){ return b.ts-a.ts }
    filter(k: LogEntry){
        const {filter} = this.state
        return !filter || filter.some(g=>EventGroups[g].includes(k.action))
    }
    get table(){
        const {list, filter} = this.state
        const rows = list.sort(this.sort.bind(this)).filter(this.filter.bind(this))
            .map(l=><LogRow entry={l} className='menu-list-row' groups={filter}
            onSubmit={o=>this.onSubmit(o)} onDelete={o=>this.deleteItem(o)}
            onReload={()=>this.fetch()} key={`order_list_${l._id}`} {...this.props} />)
        return <RB.Container className='menu-container-table'>
          <LogRowDesc className='menu-list-title' groups={filter} /> 
          {rows}
        </RB.Container>
    }
    body(){
        const {filter} = this.state
        return [<LogRowNew onSubmit={o=>this.onSubmit(o)} add={true} />,
          <Delimeter />,
          <LogActionMultiSelect value={filter} onChange={filter=>this.setState({filter})} />,
          this.table]
    }
}