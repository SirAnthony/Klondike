import React from 'react';
import * as RB from 'react-bootstrap'
import * as util from './common/util'
import * as entities from './common/entity'
import * as CError from './common/errors'

export type ErrorState = {err?: CError.ApiError}
type FetcherState = {item?: any}
type FetcherProps = {}
export class Fetcher<P, S> extends React.PureComponent<P & FetcherProps, S & ErrorState & FetcherState> {
    protected static _cache
    protected setCache(data: any) { this.cacheClass && (this.cacheClass._cache = data) 	}
    protected get cache(){ return this.cacheClass?._cache }
    cacheClass: any

    fetching = false
    fetches = 0
    componentDidMount() { this.fetch() }
    async fetch(){
        const fetcher = this.cacheClass||this
        if (fetcher.fetching)
            return fetcher.requesters.push(this)
        let cache: any
        if (this.cacheClass && (cache = this.cache))
            return void this.setState(cache);
        (fetcher.requesters = fetcher.requesters||[]).push(this)
        fetcher.fetching = true
        let data = await util.wget(this.fetchUrl, this.fetchOpt)
        fetcher.fetching = false
        fetcher.fetches++
        let obj: any = Object.assign({err: data.err||this.state?.err},
            this.fetchState(data.data))
        this.setCache(obj)
        fetcher.requesters?.forEach(f=>f.setState(obj))
    }
    get fetchUrl(){ return '' }
    get fetchOpt(){ return {} }
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