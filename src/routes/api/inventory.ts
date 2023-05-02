import {BaseRouter, CheckRole, CheckIDParam, CheckAuthenticated} from '../base'
import {CorpController, institutionController, LoanController, LogController} from '../../entity'
import {ItemController, UserController, ConfigController} from '../../entity'
import {OrderController} from '../../entity'
import {UserType, Patent, InstitutionType} from '../../../client/src/common/entity'
import {MarketType, ItemType} from '../../../client/src/common/entity'
import {LogAction, OwnerMatch} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import {IDMatch, asID} from '../../util/server'
import {Time} from '../../util/time'
import defines from '../../../client/src/common/defines'
import * as balance from '../../util/balance'
import * as iutil from '../../../client/src/inventory/Item/util'
import * as cutil from '../../util/config'
import * as crypto from 'crypto'


export class InventoryApiRouter extends BaseRouter {

    @CheckIDParam()
    @CheckAuthenticated()
    async get_entity(ctx: RenderContext){
        const {stype, id} = ctx.params;
        const entity = await institutionController(+stype)?.get(id)
        return {entity}
    }

    @CheckIDParam()
    @CheckRole(UserType.Scientist)
    async put_item_pay_patent(ctx: RenderContext){
        const {stype, id, itemid, target} = ctx.aparams
        if (!itemid || !target || !InstitutionType[+stype])
            throw 'Required fields missing'
        // Always use corp controller
        const corp = await institutionController(+stype).get(id)
        const resource = await ItemController.get(itemid)
        if (!OwnerMatch(resource.owner, corp))
            throw 'Wrong owner of resource'
        const patent = await ItemController.get(target)
        const pt = (patent as unknown) as Patent
        pt.resourceCost.forEach(k=>k.provided |= 0)
        if (pt.ready || pt.served?.length){
            pt.ready = false
            pt.served = []
            await patent.save()
            throw 'Wrong patent status'
        }
        if (await balance.pay_with_resource(resource, pt, corp.asOwner, 'post_patent_pay'))
            await patent.save()
        // Patent closed
        if (!pt.resourceCost.some(k=>k.provided<k.value)){
            pt.ready = true
            pt.served = []
            const conf = await ConfigController.get()
            const points = +conf.points.patent.pay
            await LogController.log({
                name: 'patent_pay', info: 'post_patent_pay',
                owner: corp.asOwner, item: patent, points,
                action: LogAction.PatentPaid
            })
        }
    }

    @CheckIDParam()
    @CheckRole(UserType.Corporant)
    async put_item_pay_order(ctx: RenderContext){
        const {stype, id, itemid, orderid} = ctx.aparams
        if (!itemid || !InstitutionType[+stype])
            throw 'Required fields missing'
        // Always use corp controller
        const corp = await institutionController(+stype).get(id)
        const resource = await ItemController.get(itemid)
        if (!OwnerMatch(resource.owner, corp))
            throw 'Wrong owner of resource'
        const order = await OrderController.get(orderid)
        if (!order)
            throw 'No order for corp'
        order.resourceCost.forEach(k=>k.provided |= 0)
        if (await balance.pay_with_resource(resource, order, corp.asOwner, 'post_order_pay'))
            await order.save()
        await LogController.log({
            name: 'order_pay', info: 'put_item_pay_order',
            owner: corp.asOwner, item: resource, order,
            action: LogAction.OrderPay
        })
        if (!order.resourceCost.some(k=>k.provided<k.value)){
            const conf = await ConfigController.get()
            const value = (corp as unknown as CorpController).resourceValue||{}
            const points = order.resourceCost.reduce((p, c)=>{
                const type = value[c.kind]
                return p+(conf.points.order[type]|0)
            }, 0)
            await LogController.log({
                name: 'order_close', info: 'put_item_pay_order',
                owner: corp.asOwner, item: resource, points, order,
                action: LogAction.OrderClosed
            })
        }
    }

    @CheckIDParam()
    @CheckAuthenticated()
    async put_item_pay_loan(ctx: RenderContext){
       const {stype, id, itemid, loanid} = ctx.aparams
        if (!itemid || !InstitutionType[+stype])
            throw 'Required fields missing'
        const src = await institutionController(+stype).get(id)
        const item = await ItemController.get(itemid)
        if (!OwnerMatch(item.owner, src) || item.type!=ItemType.Resource)
            throw 'Wrong owner of resource'
        const loan = await LoanController.get(loanid)
        if (!OwnerMatch(loan?.creditor, src))
            throw 'Wrong loan'
        if ((item.market?.type|0)!=MarketType.None)
            throw 'Wrong market state'
        const prices = await cutil.get_prices()
        const price = iutil.item_base_price(item, prices)
        if (loan.amount<price*defines.price.low_modifier || loan.amount>price*defines.price.high_modifier)
            throw 'Wrong loan amount'
        item.market = {type: MarketType.Loan, price,
            from: src.asOwner, to: loan.lender, code: asID(loan._id)}
        await item.save()
        await LogController.log({action: LogAction.LoanProposeItem,
            name: 'loan_propose_item', info: 'put_item_pay_loan',
            owner: src.asOwner, institution: loan.lender, item})
    }

    @CheckIDParam()
    @CheckAuthenticated()
    async put_item_close_loan(ctx: RenderContext){
        const {stype, id, itemid} = ctx.aparams
        if (!itemid)
            throw 'Required fields missing'
        const srcController = institutionController(+stype)
        const src = await srcController.get(id)
        const item = await ItemController.get(itemid)
        if (+item.market?.type!=MarketType.Loan)
            throw 'Wrong market type'
        await balance.close_with_item(src, item)
    }

    @CheckIDParam()
    @CheckAuthenticated()
    async put_item_reject_loan(ctx: RenderContext){
        const {stype, id, itemid} = ctx.aparams
        if (!itemid)
            throw 'Required fields missing'
        const srcController = institutionController(+stype)
        const src = await srcController.get(id)
        const item = await ItemController.get(itemid)
        if (+item.market?.type!=MarketType.Loan)
            throw 'Wrong market type'
        const loan = await LoanController.get(item.market.code)
        if (!OwnerMatch(loan?.lender, src) || item.type!=ItemType.Resource)
            throw 'Wrong owner of resource'
        item.market = null
        await item.save()
        await LogController.log({action: LogAction.LoanProposeReject, item,
            name: 'loan_reject_item', info: 'put_item_reject_loan',
            owner: loan.creditor, institution: src.asOwner})
    }

    @CheckIDParam()
    @CheckRole([UserType.Captain, UserType.Corporant, UserType.Scientist])
    async put_item_sell(ctx: RenderContext){
        const {stype, dtype, id, target, itemid, price} = ctx.aparams
        if (+stype==InstitutionType.User || +dtype==InstitutionType.User)
            throw 'Users cannot trade'
        const item = await ItemController.get(itemid)
        if (!item)
            throw 'Item not found'
        if ([MarketType.Sale, MarketType.Protected].includes(item.market?.type|0))
            throw 'Wrong market status'
        const srcController = institutionController(+stype)
        if (!srcController)
            throw 'No source or target type'
        const src = await srcController.get(id)
        const owners = [].concat((item as any).owners, item.owner).filter(Boolean)
        if (!owners.some(o=>OwnerMatch(o, src)))
            throw 'Cannot sell foreign item'
        const dst = !target ? null :
            await institutionController(+dtype).get(target)
        const code = crypto.randomBytes(10).toString('hex');
        item.market = {type: MarketType.Sale, price: +price, code,
            from: src.asOwner, to: dst?.asOwner}
        await item.save()
        await LogController.log({
            name: 'item_sell', info: 'put_item_sell',
            owner: src.asOwner, item,
            action: LogAction.ItemPutSale
        })
    }

    @CheckIDParam()
    @CheckAuthenticated()
    async put_item_buy(ctx: RenderContext){
        const {user}: {user: UserController} = ctx.state
        const {stype, id, itemid, code} = ctx.aparams
        if (+stype==InstitutionType.User)
            throw 'Users cannot trade'
        if (!user.admin && !IDMatch(user.relation?._id, id))
            throw 'Cannot act on foreign item'
        const item = await ItemController.get(itemid)
        if (!item)
            throw 'Item not found'
        if (![MarketType.Sale, MarketType.Loan].includes(+item.market?.type))
            throw 'Wrong market status'
        if (item.market.code!=code)
            throw 'Wrong confirmation code'
        const srcController = institutionController(+stype)
        if (!srcController)
            throw 'No source type'
        const src = await srcController.get(id)
        const market = item.market
        // Allow to pass non-owned items
        if (market.to && !OwnerMatch(market.to, src))
            throw 'Cannot act on foreign item'
        if (+market.type == MarketType.Loan)
            await balance.close_with_item(src, item)
        else
            await balance.buy_item(src, item)
    }

    @CheckIDParam()
    @CheckAuthenticated()
    async put_item_reject(ctx: RenderContext){
        const {user}: {user: UserController} = ctx.state
        const {stype, id, itemid, code} = ctx.aparams
        if (+stype==InstitutionType.User)
            throw 'Users cannot trade'
        if (!user.admin && !IDMatch(user.relation?._id, id))
            throw 'Cannot act on foreign item'
        const item = await ItemController.get(itemid)
        if (!item)
            throw 'Item not found'
        if (![MarketType.Sale, MarketType.Loan].includes(+item.market?.type))
            throw 'Wrong market status'
        if (item.market.code!=code)
            throw 'Wrong confirmation code'
        const src = await institutionController(+stype).get(id)
        item.market = null
        await item.save()
        await LogController.log({
            name: 'item_reject', info: 'put_item_reject',
            owner: src.asOwner, item,
            action: LogAction.ItemRemoveSale
        })
    }

    @CheckIDParam()
    @CheckRole([UserType.Captain, UserType.Corporant, UserType.Scientist])
    async put_item_delist(ctx: RenderContext){
        const {stype, id, itemid} = ctx.aparams
        if (+stype==InstitutionType.User)
            throw 'Users cannot trade'
        const item = await ItemController.get(itemid)
        if (!item)
            throw 'Item not found'
        if (![MarketType.Sale, MarketType.Loan].includes(+item.market?.type))
            throw 'Wrong market status'
        const src = await institutionController(+stype).get(id)
        const owners = [].concat((item as any).owners, item.owner).filter(Boolean)
        if (!src || !owners.some(o=>OwnerMatch(o, src)))
            throw 'Cannot act on foreign item'
        item.market = null
        await item.save()
        await LogController.log({
            name: 'item_delist', info: 'put_item_delist',
            owner: src.asOwner, item,
            action: LogAction.ItemRemoveSale
        })
    }

    @CheckIDParam()
    @CheckRole([UserType.Captain, UserType.Corporant, UserType.Scientist])
    async get_items_list(ctx: RenderContext){
        const {stype, id} = ctx.aparams
        const srcController = institutionController(+stype)
        if (!srcController)
            throw 'No source type'
        const src = await srcController.get(id)
        const list = await ItemController.all({$or: [
            {'owner._id': asID(src._id), 'owner.type': +src.type},
            {'owners._id': asID(src._id), 'owners.type': +src.type},
        ], type: {$ne: ItemType.Patent}})
        return {list}
    }

    @CheckIDParam()
    @CheckRole([UserType.Corporant, UserType.Scientist])
    async get_patents_list(ctx: RenderContext){
        const {stype, id} = ctx.aparams
        const srcController = institutionController(+stype)
        if (!srcController)
            throw 'No source type'
        const src = await srcController.get(id)
        const filter: any = {type: ItemType.Patent}
        if (src.type!=InstitutionType.Research){
            Object.assign(filter, {ready: true,
                'owners._id': asID(src._id), 'owners.type': +src.type})
        }
        const list = await ItemController.all(filter)
        return {list}
    }

    @CheckIDParam()
    @CheckRole([UserType.Corporant])
    async get_orders_list(ctx: RenderContext){
        const {stype, id} = ctx.params
        const srcController = institutionController(+stype)
        if (!srcController)
            throw 'No source type'
        const src = await srcController.get(id)
        const list = await OrderController.all({
            'owner._id': asID(src._id), cycle: Time.cycle})
        return {list: list?.filter(o=>o.resourceCost.some(c=>
            (c.value|0)>(c.provided|0)))}
    }
    

    @CheckIDParam()
    @CheckAuthenticated()
    async post_transfer(ctx: RenderContext){
        const {stype, dtype, id, target, amount} = ctx.aparams
        const srcController = institutionController(+stype)
        const dstController = institutionController(+dtype)
        if (!srcController || !dstController)
            throw 'field_error_noempty'
        const src = await srcController.get(id)
        const dst = await dstController.get(target)
        if (!src || !dst)
            throw 'field_error_noempty'
        const value = amount|0
        if (OwnerMatch(src, dst) || value<=0 || value>src.credit)
            throw 'field_error_invalid'
        await balance.provide_loan(src.asOwner, dst.asOwner, value)
        src.credit = (src.credit|0) - value
        dst.credit = (dst.credit|0) + value
        await src.save()
        await dst.save()
        return {credit: src.credit}
    }

    @CheckIDParam()
    @CheckAuthenticated()
    async get_balance(ctx: RenderContext){
        const {stype, id} = ctx.aparams
        const srcController = institutionController(+stype)
        const src = await srcController.get(id)
        const entity = Object.assign({
            credit: src.credit,
            cost: src.cost
        }, src.asOwner)
        const loans = await LoanController.all({
            filled: {$ne: true}, $or: [
                {'lender._id': asID(src._id), 'lender.type': +src.type},
                {'creditor._id': asID(src._id), 'creditor.type': +src.type},
              ]
        })
        return {entity, loans}
    }

    @CheckIDParam()
    @CheckAuthenticated()
    async get_proposals(ctx: RenderContext){
        const {stype, id} = ctx.aparams
        const srcController = institutionController(+stype)
        const src = await srcController.get(id)
        const list = await ItemController.all({
            'market.to._id': asID(src._id), 'market.to.type': +src.type})
        return {list}
    }

    @CheckIDParam()
    @CheckAuthenticated()
    async get_loans(ctx: RenderContext){
        const {stype, id} = ctx.aparams
        const srcController = institutionController(+stype)
        const src = await srcController.get(id)
        const list = await LoanController.all({
            filled: {$ne: true}, $or: [
                {'lender._id': asID(src._id), 'lender.type': +src.type},
                {'creditor._id': asID(src._id), 'creditor.type': +src.type},
              ]
        })
        return {list}
    }

}