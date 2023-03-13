import {BaseRouter, CheckAuthenticated, CheckRole} from '../base'
import {UserController, ShipController, ItemController} from '../../entity'
import {PlanetController} from '../../entity'
import {PlanetInfo, Profile, UserType} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import * as server_util from '../../util/server'
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

    @CheckRole(UserType.Navigator)
    async get_planet(ctx: RenderContext){
        const {id} = ctx.params;
        const {user}: {user: UserController} = ctx.state
        const planet: PlanetInfo = await PlanetController.get(id)
        const ships = await ShipController.all({'location._id': new ObjectId(id)})
        planet.ships = ships.map(s=>s.PlanetShip)
        return {planet, date: server_util.currentDate()}
    }

    @CheckRole(UserType.Navigator)
    async get_planet_list(ctx: RenderContext){
        const list: PlanetInfo[] = await PlanetController.all()
        for (let p of list) {
            p.items = await ItemController.all({'location._id': p._id})
            // p.ships = await ShipController.all({'location._id': p._id})
        }
        return {list}
    }

    @CheckRole(UserType.Navigator)
    async get_planet_list_short(ctx: RenderContext){
        const planets = await PlanetController.all()
        const list = planets.map(p=>({_id: p._id, name: p.name}))
        return {list}
    }

    @CheckRole(UserType.Master)
    async get_users_list(ctx: RenderContext){
        const list = await UserController.all()
        return {list}
    }
}