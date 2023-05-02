import React from 'react';
import * as RR from 'react-router-dom'
import * as RB from 'react-bootstrap'
import {Item, ItemType, MarketType, User} from '../common/entity'
import {InstitutionType, InstitutionTypePrefix} from '../common/entity'
import {Modal} from './modal'
import * as util from '../common/util'
import * as F from '../Fetcher'
import {default as L, LR} from './locale'
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
    onClose: ()=>void
}
export class ItemConfirmation extends F.Fetcher<ItemConfirmationProps, ItemConfirmationState> {
    get fetchUrl() { return `/api/item/${this.props.id}` }
    async onConfirm(){
        const {action, user} = this.props
        const {item} : {item: Item} = this.state
        const {market} = item
        const relation = market.to||user.relation
        if (![MarketType.Sale, MarketType.Loan].includes(market?.type|0) || !relation)
            return this.setState({err: new ClientError('Not for sale')})
        const rel = `${relation.type}/${relation._id}`
        let res = await util.wget(`/api/inventory/${rel}/item/${item._id}/${action}`, {
            method: 'PUT', data: {code: item.market.code}})
        if (res.err)
            return this.setState({err: res.err})
        this.props.onClose()
    }
    action_buy(item: Item){
        if (!item || !item.market)
            return null
        const {market} = item, aitem = item as any
        const kind = item.type===ItemType.Resource ? LR(`res_kind_${aitem.kind}`) :
            item.type==ItemType.Artifact ? LR(`artifact_kind_${aitem}`) : null
        const act = [(market.price ? L('act_buy') : L('act_get')),
            LR(`item_type_${item.type}`), kind, aitem.value,
            item.name||item._id].filter(Boolean).join(' ')
        const to = [item.market.price, item.market.to?.name].filter(Boolean).join(' ')
        return <RB.Container>
          <RB.Row>{act}</RB.Row>
          {to && <RB.Row>{L('act_transfer')+` ${to}`}</RB.Row>}
        </RB.Container>
    }
    render(){
        const {item, err} = this.state||{}
        if (!item)
            return null
        const {action} = this.props
        const body = (this[`action_${action}`]||(()=>{})).call(this, item)
        return <Modal show={item} err={err}
          onReject={()=>this.props.onClose()} onAgree={()=>this.onConfirm()}>
          {body}
        </Modal>
    }
}
export function ItemUrlConfirmator(props: {user: User, onClose: ()=>void}){
    const params = RR.useParams()
    const obj = _.pick(params, 'id', 'action', 'code')
    return <ItemConfirmation {...props} {...obj} />
}

export function Confirmator(props: {user: User}){
    const {user} = props
    const navigate = RR.useNavigate()
    const onClose = ()=>{
        const {user} = props
        const prefix = InstitutionTypePrefix[user.relation?.type]||InstitutionTypePrefix[InstitutionType.User]
        navigate(`/inventory/${prefix}/${user.relation?._id||user._id}`)
    }
    return <RR.Routes>
      <RR.Route path='/item/:id/:action/:code' element={
        <ItemUrlConfirmator {...props} onClose={onClose} />} />
    </RR.Routes>
}

