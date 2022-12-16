import {BaseRouter} from './base'
import {RenderContext} from '../middlewares'
import {UserController} from '../entity'
import * as CError from '../../client/src/common/errors'

export function CheckAdmin(){
    return (target: Object, key: string, descriptor: TypedPropertyDescriptor<any>)=>{
        return {...descriptor, value: async function check(ctx: RenderContext){
            const {user}: {user: UserController} = ctx.state
            if (!user.admin)
               throw new CError.ApiError(CError.Codes.NOT_ADMIN, 'Should be admin')
            return descriptor.value.apply(this, arguments)
        }}
    }
}

async function get_members(users: UserController[]){
       const members = []
        for (let u of users) {
            const obj: any = Object.assign({}, u)
            members.push(obj)
        }
        return members
}

function sort_members(a, b){
    if (!a) return 1
    if (!b) return -1
    return +a.name - +b.name
}

export class AdminRouter extends BaseRouter {
    async get_index(ctx: RenderContext){
        const users = await UserController.all()
        const members = await get_members(users)
        members.sort((a, b)=>a.order && b.order ? 0 : -1)
        return {members}
    }

    async get_members(ctx: RenderContext){
        const {order} = ctx.params
        const users = await UserController.all()
        const members = await get_members(users)
        members.sort(sort_members)
        return {members}
    }
}