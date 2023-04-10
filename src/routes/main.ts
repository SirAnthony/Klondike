
import {BaseRouter} from './base'
import {MarketType, User} from '../../client/src/common/entity'
import {RenderContext} from '../middlewares'
import defines from '../../client/src/common/defines'
import * as util from '../util/util'
import {ItemController} from '../entity'
import {IDMatch} from '../util/server'
import * as QRCode from 'qrcode'
import config from '../config'


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
        const {to} = item.market||{}
        if (!user.admin && to?._id && !IDMatch(to._id, user.relation?._id))
            throw 'Not found'
        const host = [util.localhost_to_ip(config.server.host), config.server.port].join(':')
        const url = `http://${host}/confirm/item/${item._id}/buy/${item.market.code}`
        const code = await QRCode.toDataURL(url, {width: 400})
        return {user, code, item}        
    }
}


