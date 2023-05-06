import {BaseRouter, CheckRole, CheckAuthenticated} from '../base'
import {LoanController, UserController, institutionController} from '../../entity'
import {ExpenseType, InstitutionType, ProfileFields, UserType} from '../../../client/src/common/entity'
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

    @CheckRole(UserType.Master | UserType.GuardFine)
    async get_fines(ctx: RenderContext){
        const list = await LoanController.all({type: ExpenseType.Fine})
        return {list}
    }

    @CheckRole(UserType.Master | UserType.GuardFine)
    async put_fine(ctx: RenderContext){
        const {data} = ctx.aparams
        if (+data?.owner?.type != InstitutionType.User)
            throw 'Fines can be put only on users'
        if ((+data.amount|0)<=0)
            throw 'Incorrect amount'
        const dst = await UserController.get(data.owner._id)
        if (!dst)
            throw 'not_found'
        const rel = dst.relation || dst
        const creditor = await institutionController(rel.type).get(rel._id)
        const fine = await LoanController.createFine(creditor.asOwner, dst.asOwner,
            data.amount, data.data)
        await fine.save()
    }

    @CheckRole(UserType.Master | UserType.GuardFine)
    async delete_fine(ctx: RenderContext){
        const {id} = ctx.aparams
        const fine = await LoanController.get(id)
        await fine.delete()
    }


}