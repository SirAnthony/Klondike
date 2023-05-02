import React from 'react'
import * as RB from 'react-bootstrap'
import {MarketType, InstitutionType, Patent, MultiOwnedItem, ItemType} from '../../common/entity'
import {OrderSelectTrigger, PatentSelectTrigger} from '../../util/popovers'
import {PopupButton} from '../../util/buttons'
import {ItemLoanInput, ItemPriceInput} from './components'
import {ItemRowProps} from './Row'
import {ApiError} from '../../common/errors'
import L from '../locale'


export type ItemActionsState = {
    err?: ApiError
    patent?: Patent
}

type ItemActionsProps = {
    onEdit: ()=>void
} & ItemRowProps

export class ItemActions extends React.Component<ItemActionsProps, ItemActionsState> {
    constructor(props){
        super(props);
    }
    get is_admin(){ return this.props.user.admin }
    get is_owner(){
        const {user, item} = this.props
        const {relation} = user||{}
        const owners = [item?.owner?._id].concat(
            (item as MultiOwnedItem).owners?.map(o=>o._id)).filter(Boolean)
        return this.is_admin || (relation && owners.includes(relation._id))
    }
    check(itype?: ItemType, etype?: InstitutionType, mtype: MarketType[] = [MarketType.None]){
        const {item} = this.props
        if (!this.check_market(mtype))
            return false
        if (!isNaN(+itype) && +itype!=item.type)
            return false
        return this.is_owner && (isNaN(+etype) || +etype==this.props.entity.type)
    }
    check_market(mtype: MarketType[]){
        const {item} = this.props, mtp = +item.market?.type
        return isNaN(mtp) || (mtp!==MarketType.Protected && mtype.includes(mtp))
    }
    btn_patent_pay(){
        const {item, entity, onPatentPay} = this.props
        if (!onPatentPay || !this.check(ItemType.Resource, InstitutionType.Research))
            return null
        return <PatentSelectTrigger item={item} owner={entity} desc={L('act_patent_pay')}
          onClick={patent=>onPatentPay(item, patent)} />
    }
    btn_order_pay(){
        const {item, entity, onOrderPay} = this.props
        if (!onOrderPay || !this.check(ItemType.Resource, InstitutionType.Corporation))
            return null
        return <OrderSelectTrigger item={item} owner={entity} desc={L('act_order_pay')}
            onClick={order=>onOrderPay(item, order)} />
    }
    btn_loan_pay(){
        const {item, onLoanPay} = this.props
        if (!onLoanPay || !this.check(ItemType.Resource))
            return null
        return <ItemLoanInput item={item} onPay={onLoanPay} />
    }
    btn_sell(){
        const {item, entity, nullable, onSell} = this.props
        if (!onSell || !this.check())
            return null
        return <ItemPriceInput item={item} onSell={onSell} source={entity}
            nullable={nullable} />
    }
    btn_code(){
        const {item} = this.props
        return <RB.Col>
          <div>{L('market_proposed', item.market.to?.name||'')}</div>
          <PopupButton url={`/item/${item._id}/code`} desc={L('act_show_code')} />
        </RB.Col>
    }
    btn_delist(){
        const {item, onDelist} = this.props
        if (!onDelist || !this.check(undefined, undefined, [MarketType.Sale, MarketType.Loan]))
            return null
        if (!item.market?.type)
            return null
        return <RB.Container><RB.Row>
          <RB.Col>{this.btn_code()}</RB.Col>
          <RB.Col>
            <RB.Button onClick={()=>onDelist(item)}>{L('act_delist')}</RB.Button>
          </RB.Col>
        </RB.Row></RB.Container>
    }
    btn_edit(){
        const {item, onEdit} = this.props
        if (!this.is_admin || !onEdit)
            return null
        return <RB.Button onClick={()=>onEdit()}>{L('act_change')}</RB.Button>
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
          {this.btn_patent_pay()}
          {this.btn_order_pay()}
          {this.btn_loan_pay()}
          {this.btn_sell()}
          {this.btn_delist()}
          {this.btn_edit()}
          {this.btn_delete()}
        </RB.Col>
    }
}