import {BaseRouter, CheckAuthenticated} from './base'
import {UserController, ShipController, CorpController} from '../entity'
import {PlanetController} from '../entity'
import {Profile, UserType} from '../../client/src/common/entity'
import {RenderContext} from '../middlewares'
import * as server_util from '../util/server'
import {ApiError, Codes} from '../../client/src/common/errors'
import {ObjectId} from 'mongodb';

export function CheckRole(roles: UserType[] | UserType){
    return (target: Object, key: string, descriptor: TypedPropertyDescriptor<any>)=>{
        return {...descriptor, value: async function check(ctx: RenderContext){
            // if (!ctx.isAuthenticated())
            //    throw new ApiError(Codes.NO_LOGIN, 'Should be authentificated')
            // const types = Array.isArray(roles) ? roles : [roles]
            // if (!types.includes(UserType.Master))
            //     types.push(UserType.Master)
            // const {user}: {user: UserController} = ctx.state
            // if (types.length && !types.includes(user.type))
            //     throw new ApiError(Codes.INCORRECT_LOGIN, 'Access denied')
            return descriptor.value.apply(this, arguments)
        }}
    }
}

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

    @CheckRole([UserType.Mechanic, UserType.Captain, UserType.Corporant, UserType.Navigator])
    async get_ship(ctx: RenderContext){
        const {id} = ctx.params;
        const {user}: {user: UserController} = ctx.state
        const ship = await ShipController.get(id)
        return {ship}
    }

    @CheckRole(UserType.Corporant)
    async get_ship_list(ctx: RenderContext){
        const list = await ShipController.all()
        return {list}
    }

    @CheckRole(UserType.Corporant)
    async get_corp(ctx: RenderContext){
        const {id} = ctx.params;
        const {user}: {user: UserController} = ctx.state
        const corp = await CorpController.get(id)
        return {corp}
    }

    @CheckRole(UserType.Master)
    async get_corp_list(ctx: RenderContext){
        const list = await CorpController.all()
        return {list}
    }

    @CheckRole(UserType.Navigator)
    async get_planet(ctx: RenderContext){
        const {id} = ctx.params;
        const {user}: {user: UserController} = ctx.state
        const planet = await PlanetController.get(id)
        const ships = await ShipController.all({'location._id': new ObjectId(id)})
        planet.ships = ships.map(s=>s.PlanetShip)
        return {planet, date: server_util.currentDate()}
    }

    @CheckRole(UserType.Navigator)
    async get_planet_list(ctx: RenderContext){
        const list = await PlanetController.all()
        return {list}
    }
}