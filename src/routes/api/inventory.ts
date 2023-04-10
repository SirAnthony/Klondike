import {BaseRouter, CheckRole, CheckIDParam} from '../base'
import {CorpController, institutionController, LogController} from '../../entity'
import {ItemController} from '../../entity'
import {UserType, Patent, PatentStatus, InstitutionType, MarketType} from '../../../client/src/common/entity'
import {Resource, LogAction} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import {IDMatch} from '../../util/server'
import * as crypto from 'crypto'

const POINTS_FOR_PATENT_PAY = 100

export class InventoryApiRouter extends BaseRouter {

    @CheckIDParam()
    @CheckRole(UserType.Scientist)
    async put_item_pay(ctx: RenderContext){
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
        const res = (resource as unknown) as Resource
        let {value} = res
        for (let k of pt.resourceCost){
            if (!res.value)
                break
            if (k.kind!=res.kind || k.value<=k.provided)
                continue
            let amount = Math.min(res.value, k.value-k.provided)
            k.provided += amount
            res.value -= amount
        }
        // Resource is single-used
        if (value != res.value) {
            // Delist from market
            res.market = null
            await LogController.log({
                name: 'resource_used', info: `post_patent_pay`,
                owner: corp.asOwner, item: res, points: 0,
                data: {value}, action: LogAction.ResourceUsed
            })
            res.value = 0
            // Should delete?
            await resource.save()
        }
        // Patent closed
        if (!pt.resourceCost.some(k=>k.provided<k.value)){
            pt.owners.forEach(o=>o.status=PatentStatus.Ready)
            const points = POINTS_FOR_PATENT_PAY
            await LogController.log({
                name: 'patent_pay', info: 'post_patent_pay',
                owner: corp.asOwner, item: patent, points,
                action: LogAction.PatentPaid
            })
        }
        await patent.save()
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

    }

    @CheckIDParam()
    @CheckRole([UserType.Captain, UserType.Corporant, UserType.Scientist])
    async put_item_delist(ctx: RenderContext){
        const {stype, id, itemid} = ctx.aparams
        
    }
} 