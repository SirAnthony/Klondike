import {BaseRouter, CheckRole, CheckIDParam, CheckAuthenticated} from '../base'
import {CorpController, institutionController, LoanController, LogController} from '../../entity'
import {ItemController, UserController, ConfigController} from '../../entity'
import {OrderController} from '../../entity'
import {UserType, Patent, PatentStatus, InstitutionType, Coordinates} from '../../../client/src/common/entity'
import {MarketType, ItemType} from '../../../client/src/common/entity'
import {Resource, ResourceCost, Owner, LogAction} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import {IDMatch} from '../../util/server'
import {Time} from '../../util/time'
import * as rating from '../../util/rating'
import * as crypto from 'crypto'

async function pay_with_resource(resource: ItemController,
    target: {resourceCost: ResourceCost[]}, owner: Owner, info: string){
    const res = (resource as unknown) as Resource
    const {value} = res
    for (let k of target.resourceCost){
        if (!res.value)
            break
        if (k.kind!=res.kind || k.value<=k.provided)
            continue
        let amount = Math.min(res.value, k.value-k.provided)
        k.provided += amount
        res.value -= amount
    }
    const used = value != res.value
    // Resource is single-used
    if (used) {
        // Delist from market
        res.market = null
        await LogController.log({
            name: 'resource_used', info,
            owner: owner, item: res, points: 0,
            data: {value}, action: LogAction.ResourceUsed
        })
        res.value = 0
        // Should delete?
        await resource.save()
    }
    return used
}

async function provide_loan(src: Owner, dst: Owner, value: number){
    const reverse = await LoanController.find({filled: {$ne: true},
        'lender._id': dst._id, 'lender.type': dst.type,
        'creditor._id': src._id, 'creditor.type': src.type})
    if (reverse) {
        const val = Math.min(reverse.amount, value)
        reverse.amount -= val
        value -= val
        reverse.filled = !reverse.amount
        await reverse.save()
    }
    if (!value)
        return
    const loan = (await LoanController.find({filled: {$ne: true},
        'lender._id': src._id, 'lender.type': src.type,
        'creditor._id': dst._id, 'creditor.type': dst.type
    })) || LoanController.create(src, dst)
    loan.amount = (loan.amount|0) + value
    await loan.save()
}

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
        const {id, itemid, target} = ctx.aparams
        if (!itemid || !target)
            throw 'Required fields missing'
        // Always use corp controller
        const corp = await CorpController.get(id)
        const resource = await ItemController.get(itemid)
        const patent = await ItemController.get(target)
        if (!IDMatch(resource.owner._id, corp._id))
            throw 'Wrong owner of resource'
        const pt = (patent as unknown) as Patent
        pt.resourceCost.forEach(k=>k.provided |= 0)
        if (pt.owners.some(o=>o.status!=PatentStatus.Created)){
            pt.owners.forEach(o=>{
                if (o.status==PatentStatus.Created)
                    o.status = PatentStatus.Ready
            })
            await patent.save()
            throw 'Wrong patent status'
        }
        if (await pay_with_resource(resource, pt, corp.asOwner, 'post_patent_pay'))
            await patent.save()
        // Patent closed
        if (!pt.resourceCost.some(k=>k.provided<k.value)){
            pt.owners.forEach(o=>o.status=PatentStatus.Ready)
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
        const {id, itemid} = ctx.aparams
        if (!itemid)
            throw 'Required fields missing'
        // Always use corp controller
        const corp = await CorpController.get(id)
        const resource = await ItemController.get(itemid)
        if (!IDMatch(resource.owner._id, corp._id))
            throw 'Wrong owner of resource'
        const orders = await OrderController.all({
            'assignee._id': corp._id, cycle: Time.cycle})
        const res = (resource as any) as Resource
        const order = orders.find(o=>o.resourceCost.some(k=>
            k.kind==res.kind && k.provided>=k.value))
        if (!order)
            throw 'No order for corp'
        order.resourceCost.forEach(k=>k.provided |= 0)
        if (await pay_with_resource(resource, order, corp.asOwner, 'post_order_pay'))
            await order.save()
        await LogController.log({
            name: 'order_pay', info: 'put_item_pay_order',
            owner: corp.asOwner, item: resource, order,
            action: LogAction.OrderPay
        })
        if (!order.resourceCost.some(k=>k.provided<k.value)){
            const conf = await ConfigController.get()
            const points = order.resourceCost.reduce((p, c)=>{
                const type = corp.resourceValue[c.kind]
                return p+conf.points.order[type]
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
       const {stype, id, itemid} = ctx.aparams
        if (!itemid)
            throw 'Required fields missing'
        const srcController = institutionController(+stype)
        const src = await srcController.get(id)
        const resource = await ItemController.get(itemid)
        if (!IDMatch(resource.owner._id, src._id))
            throw 'Wrong owner of resource'
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
        if ([MarketType.Sale, MarketType.Protected].includes(+item.market?.type))
            throw 'Wrong market status'
        const srcController = institutionController(+stype)
        const dstController = institutionController(+dtype)
        if (!srcController || !dstController)
            throw 'No source or target type'
        const src = await srcController.get(id)
        const owners = [].concat((item as any).owners, item.owner)
        if (!owners.some(o=>IDMatch(o._id, src._id)))
            throw 'Cannot sell foreign item'
        const dst = await dstController.get(target)
        const code = crypto.randomBytes(10).toString('hex');
        item.market = {type: MarketType.Sale, price: +price, code,
            from: src.asOwner, to: dst.asOwner}
        await item.save()
        await LogController.log({
            name: 'item_sell', info: 'put_item_sell',
            owner: src.asOwner, item,
            action: LogAction.ItemPutSale
        })
    }

    @CheckIDParam()
    async post_item_buy(ctx: RenderContext){
        const {user}: {user: UserController} = ctx.state
        const {stype, id, itemid, code} = ctx.aparams
        if (+stype==InstitutionType.User)
            throw 'Users cannot trade'
        if (!user.admin && !IDMatch(user.relation?._id, id))
            throw 'Cannot act on foreign item'
        const item = await ItemController.get(itemid)
        if (!item)
            throw 'Item not found'
        if (+item.market?.type!=MarketType.Sale)
            throw 'Wrong market status'
        if (item.market.code!=code)
            throw 'Wrong confirmation code'
        const srcController = institutionController(+stype)
        if (!srcController)
            throw 'No source type'
        const src = await srcController.get(id)
        const market = item.market
        if ((src.credit|0)<market.price)
            throw 'Not enough credit'
        if (market.to && !IDMatch(market.to._id, src._id))
            throw 'Cannot act on foreign item'
        const dst = await (institutionController(market.from.type)).get(market.from._id)
        const price = item.market.price
        dst.credit = dst.credit|0 + price
        src.credit = src.credit|0 - price
        if (item.type==ItemType.Patent) {
            const pt = (item as unknown) as Patent
            const status = Patent.served(pt, src) ?
                PatentStatus.Served : PatentStatus.Ready
            const prevOwners = pt.owners.map(o=>Object.assign({}, o))
            pt.owners = pt.owners.filter(o=>!IDMatch(o._id, dst._id) &&
                !IDMatch(o._id, src._id)).concat(
                {status: status, ...src.asOwner})
            const points = await rating.patent_points(pt, src, prevOwners)
            if (points) {
                await LogController.log({
                    name: 'patent_forward', info: 'post_item_buy',
                    owner: src.asOwner, item: pt, points,
                    // If patent was sold & already served once
                    // it cannot have FullOwnership, part already calculated
                    action: LogAction.PatentForwardPart,
                })
            }
        } if (item.type==ItemType.Coordinates) {
            const pt = (item as unknown) as Coordinates
            pt.owners = pt.owners.filter(o=>!(o.type==src.type && IDMatch(o._id, src._id)))
                .concat(src.asOwner)
        } else {
            item.owner = src.asOwner }
        item.market = null
        await src.save()
        await dst.save()
        await item.save()
        await LogController.log({
            name: 'item_buy', info: 'post_item_buy',
            owner: src.asOwner, item: Object.assign({price}, item.asObject),
            action: LogAction.ItemPurchase
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
        if (+item.market?.type!=MarketType.Sale)
            throw 'Wrong market status'
        const srcController = institutionController(+stype)
        if (!srcController)
            throw 'No source type'
        const src = await srcController.get(id)
        const owners = [].concat((item as any).owners, item.owner)
        if (!owners.some(o=>IDMatch(o._id, src._id)))
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
        const list = await ItemController.all({
            $or: [{'owner._id': src._id}, {'owners._id': src._id}],
            type: {$ne: ItemType.Patent}})
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
        if (src.type!=InstitutionType.Research) {
            Object.assign(filter, {'owners._id': src._id,
                'owners.status': {$exists: true, '$ne': PatentStatus.Created}})
        }
        const list = await ItemController.all(filter)
        return {list}
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
        if (IDMatch(src._id, dst._id) || value<=0 || value>src.credit)
            throw 'field_error_invalid'
        await provide_loan(src, dst, value)
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
                {'lender._id': src._id, 'lender.type': src.type},
                {'creditor._id': src._id, 'creditor.type': src.type},
              ]
        })
        return {entity, loans}
    }

} 