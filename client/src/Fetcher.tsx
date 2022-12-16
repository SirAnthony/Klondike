import React from 'react';
import * as RB from 'react-bootstrap'
import * as util from './common/util'
import * as entities from './common/entity'
import * as CError from './common/errors'

export type ErrorState = {err?: CError.ApiError}
type ItemState = {item?: any}
export class Fetcher<P, S> extends React.PureComponent<P & {}, S & ErrorState & ItemState> {
    fetch_url = ''
    fetching = false
    fetches = 0
    componentDidMount() { this.fetch() }
    async fetch(){
        if (this.fetching)
            return
        this.fetching = true
        let data = await util.wget(this.fetch_url)
        this.fetching = false
        this.fetches++
        let obj: any = Object.assign({err: data.err||this.state?.err},
            this.fetchState(data.data))
        this.setState(obj)
    }
    fetchState(data: any){ return {item: data} }
    render(){
        const err = this.state?.err
        if (!err)
            return null
        return <RB.Alert variant="danger">{err.message}</RB.Alert>
    }
}

type SelectorState = ErrorState & {
    items: entities.Identifier[]
    selected: string
}

type SelectorProps = {
    selected?: string
    onSelect: Function
    name: string
    exclude?: string[] 
}

export class Selector extends React.PureComponent<SelectorProps, SelectorState> {
    target_url = ''
    constructor(props: any){
        super(props)
        this.state = {items: [], selected: props.selected || 'none'}
        this.onSelect = this.onSelect.bind(this)
    }
    componentDidMount() {
         this.fetch() }
    async fetch(){
        let data = await util.wget(`${this.target_url}/names`)
        let exclude = this.props.exclude||[]
        let items = (data.data||[]).filter(
            (c: entities.Identifier)=>!exclude.includes(c._id||''))
        let obj = {err: data.err||this.state.err, items}
        this.setState(obj)
    }
    onSelect(event: any){
        let {value} = event.target
        let item = this.state.items.find(f=>f._id===value)
        if (!item)
            return
        this.setState({selected: value})
        this.props.onSelect(item)
    }
    render(){
        let options = this.state.items.map(f=>
            <option key={f._id} value={f._id}>{f._id}</option>)
        options.unshift(<option key="0" value="none" disabled={true}>{this.props.name}</option>)
        return <RB.Form>
          <RB.Form.Label>Add new</RB.Form.Label>
          <RB.Form.Control as="select" value={this.state.selected} onChange={this.onSelect}>
            {options}
          </RB.Form.Control>
        </RB.Form>
    }
}