import {BaseRouter, CheckRole, CheckIDParam, CheckAuthenticated} from '../base'
import {CorpController, institutionController, LogController} from '../../entity'
import {ItemController, UserController, ConfigController} from '../../entity'
import {OrderController} from '../../entity'
import {UserType, Patent, PatentStatus, InstitutionType} from '../../../client/src/common/entity'
import {MarketType} from '../../../client/src/common/entity'
import {Resource, ResourceCost, Owner, LogAction} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import {IDMatch} from '../../util/server'
import {Time} from '../../util/time'
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

export class InventoryApiRouter extends BaseRouter {

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
            const points = conf.points.patent.pay
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
        if (!IDMatch(item.owner._id, src._id))
            throw 'Cannot sell foreign item'
        const dst = await dstController.get(target)
        const code = crypto.randomBytes(10).toString('hex');
        item.market = {type: MarketType.Sale, price: +price, code, to: dst.asOwner}
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
        if (item.market.to && !IDMatch(item.market.to._id, src._id))
            throw 'Cannot act on foreign item'
        const dst = await (institutionController(item.owner.type)).get(item.owner._id)
        dst.credit = dst.credit|0 + item.market.price
        item.owner = src.asOwner
        item.market = null
        await dst.save()
        await item.save()
        await LogController.log({
            name: 'item_buy', info: 'post_item_buy',
            owner: src.asOwner, item,
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
        if (!IDMatch(item.owner._id, src._id))
            throw 'Cannot act on foreign item'
        item.market = null
        await item.save()
        await LogController.log({
            name: 'item_delist', info: 'put_item_delist',
            owner: src.asOwner, item,
            action: LogAction.ItemRemoveSale
        })
    }
} 