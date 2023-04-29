import React from 'react';
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import {ShipDesc} from './Ship'
import {Ship as EShip, User} from '../common/entity'
import {ControlBar} from '../util/controls'
import L from './locale'

type ShipDetailsState = {
    ship?: EShip
}
type ShipDetailsProps = {
    user: User
    id?: string
    onClose?: ()=>void
}

export default class ShipDetails extends F.Fetcher<ShipDetailsProps, ShipDetailsState> {
    constructor(props){
        super(props)
        this.state = {}
    }
    get fetchUrl() {
        const {id = ''} = this.props
        return `/api/ship/${id}`
    }
    fetchState(data: any = {}){
        const {ship} = data
        return {item: data, ship}
    }
    render(){
        const {ship} = this.state
        return <RB.Container className="menu-container">
          <ControlBar title={L('interface')} onClose={this.props.onClose} />
          {ship ? <ShipDesc ship={ship} /> : <div>{L('not_found')}</div>}
        </RB.Container>
    }
}

