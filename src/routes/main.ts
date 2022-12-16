
import {BaseRouter} from './base'
import {User} from '../../client/src/common/entity'
import {RenderContext} from '../middlewares'

export class MainRouter extends BaseRouter {
    async get_base(ctx: RenderContext){
        return {}
    }
    async get_index(ctx: RenderContext){
        const {user}: {user: User} = ctx.state
        ctx.debug({all: ctx.params.all})
        return {user}
    }
}


