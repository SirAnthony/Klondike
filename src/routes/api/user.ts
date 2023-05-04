import {BaseRouter, CheckRole, CheckAuthenticated} from '../base'
import {UserController, institutionController} from '../../entity'
import {ProfileFields, UserType} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import * as uutil from '../../util/user'
import {ApiError, Codes} from '../../../client/src/common/errors'

export class UserApiRouter extends BaseRouter {
    async get_index(ctx: RenderContext){
        const {user}: {user: UserController} = ctx.state
        ctx.debug({all: ctx.params.all})
        return {user}
    }

    @CheckRole(UserType.Master)
    async post_profile(ctx: RenderContext){
        const {user}: {user: UserController} = ctx.state
        const body =  ctx.request.body||{}
        const data = ProfileFields.fields.reduce((p, k)=>{
            if (body[k])
                p[k] = body[k]
            return p
        }, {});
        const data_keys = Object.keys(data)
        this.check_param(ctx, data_keys.length, 'profile', 'Empty response')
        this.check_param(ctx, !ProfileFields.static.some(k=>data_keys.includes(k)),
            'profile', 'Cannot change')
        for (let k in data)
            user[k] = data[k]
        await user.save()
        return {done: 1, user}
    }

    @CheckAuthenticated()
    async get_profile(ctx: RenderContext){
        const {user}: {user: UserController} = ctx.state
        const {id, type} = ctx.aparams
        const target = !id ? user : await institutionController(+type).get(id)
        if (!target)
            throw 'Not found'
        const data = target.asObject
        data.info = await uutil.process_data(data.data)
        return {user: data}
    }
}