
import * as KoaRouter from 'koa-router'
import  * as multer from '@koa/multer'
import {RenderContext} from '../middlewares'
import {Identifier, UserType, UserTypeIn} from '../../client/src/common/entity'
import {UserController} from '../entity'
import {ApiError, Codes} from '../../client/src/common/errors'
import {IDMatch} from '../util/server'
const Uploader = multer()

export function CheckAuthenticated(){
    return (target: Object, key: string, descriptor: TypedPropertyDescriptor<any>)=>{
        return {...descriptor, value: async function check(ctx: RenderContext){
            if (!ctx.isAuthenticated())
               throw new ApiError(Codes.NO_LOGIN, 'Should be authentificated')
            return descriptor.value.apply(this, arguments)
        }}
    }
}

export function CheckParam(rules={}){
    return (target: Object, key: string, descriptor: TypedPropertyDescriptor<any>)=>{
        return {...descriptor, value: async function check(ctx: RenderContext){
            try { ctx.verifyParams(rules) }
            catch(e) {
                if (e.code == 'INVALID_PARAM')
                    e.code = Codes.INCORRECT_PARAM
                throw ApiError.from(e)
            }
            return descriptor.value.apply(this, arguments)
        }}
    }
}

export function CheckRole(roles: UserType[] | UserType){
    return (target: Object, key: string, descriptor: TypedPropertyDescriptor<any>)=>{
        return {...descriptor, value: async function check(ctx: RenderContext){
            if (!ctx.isAuthenticated())
               throw new ApiError(Codes.NO_LOGIN, 'Should be authentificated')
            const types = Array.isArray(roles) ?
                roles.reduce((p, r)=>p|=r, UserType.Master) : (roles | UserType.Master)
            const {user}: {user: UserController} = ctx.state
            if (types && !UserTypeIn(user, types))
                throw new ApiError(Codes.INCORRECT_LOGIN, 'Access denied')
            return descriptor.value.apply(this, arguments)
        }}
    }
}

export function CheckOwn(roles: UserType = 0, param_fn?: (ctx: RenderContext)=>Identifier){
    param_fn = param_fn || ((ctx: RenderContext)=>{
        const {id, stype} = ctx.aparams
        return {_id: id, name: '', type: stype}
    })
    return (target: Object, key: string, descriptor: TypedPropertyDescriptor<any>)=>{
        return {...descriptor, value: async function check(ctx: RenderContext){
            if (!ctx.isAuthenticated())
               throw new ApiError(Codes.NO_LOGIN, 'Should be authentificated')
            const {user}: {user: UserController} = ctx.state
            if (!UserTypeIn(user, (roles | UserType.Master))){
                const test = param_fn(ctx)
                if (!IDMatch(user._id, test._id) && !IDMatch(user.relation._id, test._id))
                    throw new ApiError(Codes.INCORRECT_LOGIN, 'Access denied')
            }
            return descriptor.value.apply(this, arguments)
        }}
    }
}


export function CheckIDParam(param: string = 'id'){
    return (target: Object, key: string, descriptor: TypedPropertyDescriptor<any>)=>{
        return {...descriptor, value: async function check(ctx: RenderContext){
            if (!ctx.isAuthenticated())
               throw new ApiError(Codes.NO_LOGIN, 'Should be authentificated')
            const id = ctx.aparams[param]
            const {user}: {user: UserController} = ctx.state
            if (!UserTypeIn(user, UserType.Master) && !(id && (IDMatch(id, user.relation?._id) || IDMatch(id, user._id))))
                throw new ApiError(Codes.INCORRECT_LOGIN, 'Access denied')
            return descriptor.value.apply(this, arguments)
        }}
    }
}

type RouterOptions = {
    json?: boolean
    admin?: boolean
}

export class BaseRouter {
    prefix: string
    r: KoaRouter
    opt: RouterOptions
    constructor(urls: any, prefix?: string, opt: RouterOptions = {}){
        this.prefix = prefix
        this.opt = opt
        this.r = new KoaRouter({prefix: this.prefix});
        for (let r in urls){
            const {func, url = r} = urls[r]
            this.add(url, func, urls[r])
        }
    }
    protected uploads(opt: any){
        const {uploads} = opt
        if (!uploads)
            return []
        if (Array.isArray(uploads))
            return [Uploader.fields(uploads)]
        return [Uploader.single(uploads)]  
    }
    protected add(uri: string, func: string, opt: any = {}){
        const methods = opt.methods||['get', 'post']
        for (let m of methods){
            const name = `${m}_${func}`
            if (!this[name])
                throw new Error(`No ${name} method defined for ${uri}`)
            const json = this.opt.json || opt.json===true ||
                Array.isArray(opt.json) && opt.json.includes(m)
            const need_admin = this.opt.admin
            const uploads = this.uploads(opt)
            const args: any[] = [uri, ...uploads, async (ctx: RenderContext, next)=>{
                try {
                    if (need_admin && (!ctx.isAuthenticated() || !ctx.state.user.admin))
                        throw new ApiError(Codes.NOT_ADMIN, 'Permission denied') 
                    const ret = await this[name](ctx, next);
                    if (json)
                        return await ctx.json(ret)
                    if (!opt.no_render)
                        await ctx.render(opt.template, ret)
                } catch(e) {
                    if (typeof e==='string')
                        e = {code: Codes.SERVER_ERROR, message: e}
                    const err = ApiError.from(e), {status} = err
                    if (json) {
                        ctx.status = status
                        return await ctx.json({err, status})
                    }
                    await ctx.render('error', {err, status})
                }
            }]
            if (opt.name)
                args.unshift(opt.name)
            if (opt.chain)
                args.push.apply(args, opt.chain)
            this.r[m](...args)
        }
    }
    routes(){ return this.r.routes() }
    methods(){ return this.r.allowedMethods() }
    check_param(ctx, check, field, message){
        if (check)
            return
        const code = Codes.INCORRECT_PARAM
        return ctx.throw(new ApiError(code, 'field_error_invalid',
            [{code, field, message}]))
    }
}

