
import {BaseRouter} from './base'
import {MarketType, User} from '../../client/src/common/entity'
import {RenderContext} from '../middlewares'
import defines from '../../client/src/common/defines'
import * as util from '../util/util'
import {ItemController} from '../entity'
import * as QRCode from 'qrcode'


export class MainRouter extends BaseRouter {
    async get_base(ctx: RenderContext){
        const styles = util.flatten_object_dash(defines.styles)
        return {styles}
    }
    async get_index(ctx: RenderContext){
        const {user}: {user: User} = ctx.state
        const styles = util.flatten_object_dash(defines.styles)
        ctx.debug({all: ctx.params.all})
        return {user, styles}
    }

    async get_item_code(ctx: RenderContext){
        const {user}: {user: User} = ctx.state
        const {id} = ctx.aparams
        const item = await ItemController.get(id)
        if (!item || item.market?.type!=MarketType.Sale)
            throw 'Not found'
        const code = await QRCode.toDataURL(`/item/${item._id}/buy`)
        return {user, code, item}        
    }
}


