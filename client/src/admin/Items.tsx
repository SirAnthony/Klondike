import React from 'react'
import * as RB from 'react-bootstrap'
import {Item, ResourceType, User} from '../common/entity'
import {List as UList} from '../util/controls'
import {ItemRow, ItemRowDesc, ItemRowNew} from '../inventory/Item'
import {NumberInput} from '../util/inputs';
import {default as L, LR} from './locale'
import * as util from '../common/util'
import {ConfigFetcher} from '../site/Config';
import {Config} from '../common/config'
import {Delimeter} from '../util/components'
import {ErrorMessage} from '../util/errors';

type ListState = {
}
type ListProps = {
    user: User
}

export function ListNavigator(props: {user: User}){
    const {user} = props
    return <List user={user} />
}

type ConfigControlState = {
    show: Boolean
}
type ConfigControlProps = {}
class ConfigControl extends ConfigFetcher<ConfigControlProps, ConfigControlState> {
    L = L
    res_row(cycle: number, data: {[k in ResourceType]: number}){
        const {item} : {item?: Config} = this.state
        const onChange = (k: ResourceType, val: number)=>{
            const obj = Object.assign({}, item)
            item.price.res[cycle][k] = val
            this.setState({item: obj})
        }
        const cols = Object.keys(ResourceType).filter(k=>!isNaN(+k)).map(k=><RB.Col>
            <NumberInput value={item.price.res[cycle][k]} placeholder={LR(`res_kind_${k}`)}
                onChange={val=>onChange(+k, val)}/>     
          </RB.Col>)
        return <RB.Row className='menu-list-row'>
            <RB.Col sm={1}>{LR('cycle')+' '+cycle}</RB.Col>
            {cols}
        </RB.Row>
    }
    add_res_row(){
        const {item}: {item?: Config} = this.state
        if (!item)
            return
        (item.price.res = item.price.res||[]).push(
            Object.assign({}, item.price.res[0]))
        this.setState({item: Object.assign({}, item)})
    }
    toggleButton(){
        const {show} = this.state
        const toggleResources = ()=>this.setState({show: !show})
        return <RB.Button className='auto-width' onClick={toggleResources}>
          {L('res_show')+' '+(show ? '⇑' : '⇓')}
        </RB.Button>
    }
    render(){
        const {item, err, show} = this.state
        if (!show)
            return <RB.Container>{this.toggleButton()}</RB.Container>
        if (!item)
            return <span>{LR('not_found')}</span>
        const {res = []} = (item as Config).price
        const res_rows = res.map((r, i)=>this.res_row(i, r))
        return <RB.Container>
          {err && <RB.Row><RB.Col><ErrorMessage field={err} /></RB.Col></RB.Row>}
          <RB.Row className='menu-input-row'>
            <RB.Col>{this.toggleButton()}</RB.Col>
            <RB.Col>{L('config_setup_prices')}</RB.Col>
            <RB.Col sm={2}><RB.Button onClick={()=>this.add_res_row()}>
              {L('act_add_cycle')}
            </RB.Button></RB.Col>
            <RB.Col sm={3}><RB.Button onClick={()=>this.onSubmit()}>
              {L('act_save')}
            </RB.Button></RB.Col>
          </RB.Row>
          {res_rows}
        </RB.Container>
    }
}


class List extends UList<ListProps, ListState> {
    L = L
    get fetchUrl() { return `/api/admin/items/` }
    get containerClass() { return 'menu-container-full' }
    async createItem(item: Item){
        let data = new item.class()
        for (let k of data.keys)
            data[k] = item[k]
        const res = await util.wget('/api/admin/item/create',
            {method: 'POST', data: {data}})
        if (res.err)
            return void this.setState({err: res.err})
        this.setState({err: null})
        this.fetch()
    }
    async deleteItem(item: Item){
        if (!item?._id)
            return null
        const res = await util.wget(`/api/admin/item/${item._id}/delete`,
            {method: 'DELETE'})
        if (res.err)
            return this.setState({err: res.err})
        this.fetch()
    }
    newItem(){
        return <RB.Container key='new_item_ctrl'>
          <ItemRowNew onCreate={(item: Item)=>this.createItem(item)} />
        </RB.Container>
    }
    body(){
        const {list} = this.state
        const rows = list.map(l=><ItemRow className='menu-list-row' key={`item_list_${l._id}`}
          onDelete={item=>this.deleteItem(item)} item={l} long={true} user={this.props.user} />)
        return [
          <ConfigControl />,
          <Delimeter key='res_delimeter' />,
          this.newItem(),
          <ItemRowDesc key='item_row_desc' className='menu-list-title' long={true} />,
          <Delimeter key='res_delimeter2' />,
          ...rows
        ]
    }
}