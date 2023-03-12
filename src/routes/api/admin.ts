import {BaseRouter, CheckRole} from '../base'
import {UserController, CorpController} from '../../entity'
import {ResourceController, ItemController} from '../../entity'
import {ItemType, UserType, Resource} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import * as server_util from '../../util/server'
import {ApiError, Codes} from '../../../client/src/common/errors'

export class AdminApiRouter extends BaseRouter {
    async get_index(ctx: RenderContext){
        const {user}: {user: UserController} = ctx.state
        ctx.debug({all: ctx.params.all})
        return {user}
    }

    @CheckRole(UserType.Master)
    async get_items_list(ctx: RenderContext){
        const list = await ItemController.all()
        return {list}
    }

    @CheckRole(UserType.Master)
    async post_item_change(ctx: RenderContext){
        const {_id} = ctx.params
        const params: any = ctx.request.body
        const {data = {}} = params
        let item = await ItemController.get(_id)
        for (let k of data)
            item[k] = data[k]
        await item.save()
    }
}