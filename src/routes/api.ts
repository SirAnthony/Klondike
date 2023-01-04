import {BaseRouter, CheckAuthenticated} from './base'
import {UserController, ShipController} from '../entity'
import {Profile} from '../../client/src/common/entity'
import {RenderContext} from '../middlewares'
import {ApiError, Codes} from '../../client/src/common/errors'
import {ObjectId} from 'mongodb';

export class ApiRouter extends BaseRouter {
    async get_index(ctx: RenderContext){
        const {user}: {user: UserController} = ctx.state
        ctx.debug({all: ctx.params.all})
        return {user}
    }

    @CheckAuthenticated()
    async post_profile(ctx: RenderContext){
        const {user}: {user: UserController} = ctx.state
        const body =  ctx.request.body||{}
        const data = Profile.fields.reduce((p, k)=>{
            if (body[k])
                p[k] = body[k]
            return p
        }, {});
        const data_keys = Object.keys(data)
        this.check_param(ctx, data_keys.length, 'profile', 'Empty response')
        this.check_param(ctx, !Profile.static.some(k=>data_keys.includes(k)),
            'profile', 'Cannot change')
        for (let k in data)
            user[k] = data[k]
        await user.save()
        return {done: 1, user}
    }

    // @CheckAuthenticated()
    async get_ship(ctx: RenderContext){
        const {id} = ctx.params;
        const {user}: {user: UserController} = ctx.state
        const ship = await ShipController.get(id)
        return {ship}
    }

}