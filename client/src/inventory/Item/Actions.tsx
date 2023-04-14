import React from 'react'
import * as RB from 'react-bootstrap'
import {MarketType, InstitutionType, Patent} from '../../common/entity'
import {PatentSelectTrigger} from '../../util/popovers'
import {PopupButton} from '../../util/buttons'
import {ItemPriceInput} from './components'
import {ItemRowProps} from './Row'
import {ApiError, FormError} from '../../common/errors'
import L from '../locale'


export type ItemActionsState = {
    err?: ApiError
    patent?: Patent
}

export class ItemActions extends React.Component<ItemRowProps, ItemActionsState> {
    constructor(props){
        super(props);
    }
    get is_admin(){ return this.props.user.admin }
    get is_owner(){
        const {user, item} = this.props
        return user && item && user._id == item.owner?._id
    }
    btn_pay(){
        const {item, corp, onPay} = this.props
        if (!onPay || !this.is_admin && !(this.is_owner && corp.type==InstitutionType.Research))
            return null
        return <PatentSelectTrigger item={item} corp={corp} desc={L('act_pay')}
          onClick={patent=>onPay(item, patent)} />
    }
    btn_sell(){
        const {item, onSell, onDelist} = this.props
        if (!onSell || !this.is_admin && !(this.is_owner && item.market?.type!=MarketType.Protected))
            return null
        if (item.market?.type!=MarketType.Sale)
            return <ItemPriceInput item={item} onSell={onSell} />
        return <RB.Container><RB.Row>
          <RB.Col>
            <PopupButton url={`/item/${item._id}/code`} desc={L('act_show_code')} />
          </RB.Col>
          <RB.Col>
            <RB.Button onClick={()=>onDelist(item)}>{L('act_delist')}</RB.Button>
          </RB.Col>
        </RB.Row></RB.Container>
    }
    btn_delete(){
        const {item, onDelete} = this.props
        if (!this.is_admin || !onDelete)
            return null
        return <RB.Button onClick={()=>onDelete(item)}>{L('act_delete')}</RB.Button>
    }
    render() {
        if (!this.props.item)
            return null
        return <RB.Col sm={this.props.layout}>
          {this.btn_pay()}
          {this.btn_sell()}
          {this.btn_delete()}
        </RB.Col>
    }
}