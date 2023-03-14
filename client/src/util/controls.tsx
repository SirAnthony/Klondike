import React from 'react'
import * as RR from 'react-router-dom'
import * as RB from 'react-bootstrap'
import {CloseButton} from './buttons'
import {ErrorMessage} from './errors'
import * as F from '../Fetcher'

export function ControlBar(props: {title?: string, closeTo?: string, onClose?: ()=>void}){
    const {title = '', onClose, closeTo} = props
    return <RB.Row className="menu-control">
      <RB.Col>{title}</RB.Col>
      <RB.Col sm={1}><CloseButton onClose={onClose} to={closeTo} /></RB.Col>
    </RB.Row>
}

export class Menu<P, S> extends React.PureComponent<P, S & F.ErrorState> {
    L: (string)=>string
    get closeLink() { return undefined }
    constructor(props){
        super(props)
        this.state = {} as any
    }
    body(): JSX.Element[] {
        return []
    }
    content(){
        const {err} = this.state
        if (err)
            return [<ErrorMessage field={err} />]
        return this.body()
    }
    render(){
        const body = this.content()
        return <RB.Container className="menu-container">
          <ControlBar title={this.L('interface')} closeTo={this.closeLink} />
          {body}
        </RB.Container>
    }
}

type ListState = {list?: any[]}
export class List<P, S> extends F.Fetcher<P, S & ListState> {
    L: (string)=>string
    get closeLink() { return undefined }
    constructor(props){
        super(props)
        this.state = {} as any
    }
    fetchState(data: any = {}){
        const {list} = data
        return {item: data, list}
    }
    body(): JSX.Element[] {
        return []
    }
    render(){
        const {list, err} = this.state
        const body = list ? this.body() :
            [<div key={'list_empty'}>{this.L('not_found')}</div>]
        if (err)
            body.unshift(<ErrorMessage field={err} />)
        return <RB.Container className="menu-container">
          <ControlBar title={this.L('listing')} closeTo={this.closeLink} />
          {body}
        </RB.Container>
    }
}
