import React from 'react';
import * as RR from 'react-router-dom'
import * as RB from 'react-bootstrap'
import {Item, MarketType, User} from '../common/entity'
import {InstitutionType, InstitutionTypePrefix} from '../common/entity'
import {Modal} from './modal'
import * as util from '../common/util'
import * as F from '../Fetcher'
import L from './locale'
import * as _ from 'lodash'
import {ApiError, ClientError} from '../common/errors';

type ItemConfirmationState = {
    item: Item
    err?: ApiError
}
type ItemConfirmationProps = {
    user: User
    id: string
    action: string
    code: string
    navigate: Function
}
export class ItemConfirmation extends F.Fetcher<ItemConfirmationProps, ItemConfirmationState> {
    get fetchUrl() { return `/api/item/${this.props.id}` }
    async onConfirm(){
        const {user, action} = this.props
        const {item} : {item: Item} = this.state
        const {market} = item
        if (!market || market.type!=MarketType.Sale)
            return this.setState({err: new ClientError('Not for sale')})
        const rel = `${market.to.type}/${market.to._id}`
        let res = await util.wget(`/api/inventory/${rel}/item/${item._id}/${action}`, {
            method: 'POST', data: {code: item.market.code}})
        if (res.err)
            return this.setState({err: res.err})
        this.onClose()
    }
    onClose(){
        const {user} = this.props
        const prefix = InstitutionTypePrefix[user.relation?.type]||InstitutionTypePrefix[InstitutionType.User]
        this.props.navigate(`/inventory/${prefix}/${user.relation?._id||user._id}`)
    }
    action_buy(item: Item){
        if (!item || !item.market)
            return null
        return <RB.Container>
          <RB.Row>{L('act_buy')+` ${item.name}`}</RB.Row>
          <RB.Row>{L('act_transfer')+` ${item.market.price} ${item.owner.name}`}</RB.Row>
        </RB.Container>
    }
    render(){
        const {item, err} = this.state||{}
        if (!item)
            return null
        const {action} = this.props
        const body = (this[`action_${action}`]||(()=>{})).call(this, item)
        return <Modal show={item} err={err}
          onReject={()=>this.onClose()} onAgree={()=>this.onConfirm()}>
          {body}
        </Modal>
    }
}

export function ItemConfirmator(props: {user: User}){
    const params = RR.useParams()
    const obj = _.pick(params, 'id', 'action', 'code')
    const navigate = RR.useNavigate()
    return <ItemConfirmation {...props} {...obj} navigate={navigate} />
}

export function Confirmator(props: {user: User}){
    return <RR.Routes>
      <RR.Route path='/item/:id/:action/:code' element={<ItemConfirmator {...props} />} />
    </RR.Routes>
}

