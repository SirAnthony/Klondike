
import * as nunjucks from 'nunjucks'
import * as passport from 'koa-passport'
import * as session from 'koa-session'
import * as koaBody from 'koa-bodyparser'
import * as parameter from 'koa-parameter'
import * as KoaRouter from 'koa-router'
import * as logger from 'koa-logger'
import * as serve from 'koa-static-server'
//import * as CSRF from 'koa-csrf'
import * as Koa from 'koa'
import config from './config'
import * as defines from './defines'
import merge = require('lodash.merge')
import * as fs from 'fs'
import {account} from './auth'
import {env} from 'process'

export const NJ = nunjucks.configure('templates', {})

export interface RenderContext extends KoaRouter.IRouterContext {
    render(view: string, r_ctx: any)
    json(r_ctx: any),
    flash(key: string, value: any)
    debug(obj: any),
    returnTo(dflt?: string)
    verifyParams(routes?: any)
}

const login_redirect = async (ctx: RenderContext, next: Function)=>{
    const {state} = ctx
    // After successful login, redirect back to the intended page
    if (!state.user && !ctx.path.match(/^\/auth/) && !ctx.path.match(/\./))
        ctx.session.returnTo = ctx.path
    else if (ctx.state.user && ctx.path == '/account')
        ctx.session.returnTo = ctx.path
    await next()
}

const client_files = (()=>{
    const index = config.client_static+'/../index.html'
    let html = fs.readFileSync(index).toString()
    const types = {js: /\/static\/(js\/\S+\.js)/, css: /\/static\/(css\/\S+.css)/}
    const ret = {}
    for (let t in types) {
        const match = types[t].exec(html)
        if (match && match[1])
            ret[t] = match[1]
    }
    console.log(`Reading ${index}, using client files ${JSON.stringify(ret)}`)
    return ret
})()

async function render(view: string, context:any = {}){
    if (!view)
        throw new Error('Undefined template rendered')
    const type = /\.(\w+)$/.exec(view)
    if (!type || !type[1])
        view += '.html'
    context = Object.assign({}, this.state, context)
    const ctx = {context, config, defines, csrf: this.csrf,
        user: this.state.user, debug: this.state.debug,
        STATIC_URL: config.static_url, client_files,
        CLIENT_STATIC: config.client_static}
    const pr = new Promise((resolve, reject)=>
        NJ.render(view, ctx, (err, ret)=>{
        if (err)
            return reject(err)
        resolve(ret)
    }))
    this.body = await pr
    this.type = type && type[1] || 'html'
    if (context.status)
        this.status = context.status
}

const add_render = (ctx: RenderContext, next: Function)=>{
    if (ctx.render)
        return next()
    ctx.state.debug = Object.assign({
        errors: env.NODE_ENV!='production'
    }, ctx.state.debug)
    ctx.debug = obj=>merge(ctx.state.debug, obj)
    ctx.state.flash = ctx.state.flash||{}
    ctx.flash = (k, v)=>ctx.state.flash[k]=v
    ctx.render = render.bind(ctx)
    ctx.json = k=>ctx.body=k
    ctx.returnTo = function(def?: string){
       return this.redirect(ctx.session.returnTo||def||'/') }
    return next()
}

const allow_origin = (ctx: KoaRouter.RouterContext, next)=>{
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Expose-Headers', 'Content-Length, Date, ETag');
    ctx.set('Access-Control-Allow-Credentials', 'true');
    if (ctx.method=='OPTIONS') {
        ctx.set('Access-Control-Allow-Methods', 'HEAD, GET, POST, OPTIONS');
        ctx.set('Access-Control-Allow-Headers', 'Content-Type, '+
            'X-Requested-With, Origin, Accept, Range, Cache-Control');
        ctx.set('Access-Control-Max-Age', '600');
    }
    return next()
}

const verify_param = (...args)=>{
    return args
}

export function load(app: Koa, conf: any){
    app.keys = [conf.session_secret]
    app.use(logger())
    app.use(serve({rootDir: config.static_dir, rootPath: config.static_url}))
    app.use(serve({rootDir: config.client_static, rootPath: config.client_url}))
    app.use(session({key: conf.session}, app))
    app.use(allow_origin)
    app.use(koaBody())
    //app.use(new CSRF({excludedMethods: ['GET', 'HEAD', 'OPTIONS'],
    //    disableQuery: false}))
    app.use(passport.initialize())
    app.use(passport.session())
    account.register()
    // app.use(login_redirect)
    app.use(parameter(app))
    app.use(add_render)
}
