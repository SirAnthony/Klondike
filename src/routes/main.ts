
import {BaseRouter} from './base'
import {User} from '../../client/src/common/entity'
import {RenderContext} from '../middlewares'
import defines from '../../client/src/common/defines'
import * as util from '../util/util'


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
}


