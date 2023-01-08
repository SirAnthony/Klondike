import React from 'react'
import * as RR from 'react-router-dom'
import * as RB from 'react-bootstrap'
import {Corporation as ECorp} from '../common/entity'
import * as util from '../common/util'
import {ControlBar} from '../util/controls'
import L from './locale'

type CorpProps = {
    corp: ECorp
}

export default function Corporation(props: CorpProps){
    const {corp} = props
    return (<RB.Container className="menu-container">
      <ControlBar title={L('interface')} />
      <RB.Row>
        <RB.Col>{corp.name}</RB.Col>
      </RB.Row>
    </RB.Container>)
}