import React from 'react'
import * as RR from 'react-router-dom'
import * as RB from 'react-bootstrap'
import {CloseButton} from './buttons'

export function ControlBar(props: {title?: string}){
    const {title = ''} = props
    return <RB.Row className="menu-control">
      <RB.Col>{title}</RB.Col>
      <RB.Col sm={1}><CloseButton /></RB.Col>
    </RB.Row>
}