import React from 'react'
import * as RR from 'react-router-dom'
import * as RB from 'react-bootstrap'
import {CloseButton} from './buttons'
import {ErrorMessage} from './errors'
import * as F from '../Fetcher'

export function ControlBar(props: {title?: string, onClose?: ()=>void}){
    const {title = '', onClose} = props
    return <RB.Row className="menu-control">
      <RB.Col>{title}</RB.Col>
      <RB.Col sm={1}><CloseButton onClose={onClose} /></RB.Col>
    </RB.Row>
}

type ListState = {list?: any[]}
export class List<P, S> extends F.Fetcher<P, S & ListState> {
    L: (string)=>string
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
    content(){
        const {list, err} = this.state
        if (err)
            return [<ErrorMessage field={err} />]
        if (!list)
            return [<div>{this.L('not_found')}</div>]
        return this.body()
    }
    render(){
        const body = this.content()
        return <RB.Container className="menu-container">
          <ControlBar title={this.L('listing')} />
          {body}
        </RB.Container>
    }
}
