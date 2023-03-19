
import {MainRouter, AuthRouter, AdminRouter} from '.'
import {ApiRouter, CorpApiRouter, AdminApiRouter, ShipApiRouer} from './api'
import {RenderContext} from '../middlewares'
import {Environment} from 'nunjucks'
import * as date from '../../client/src/common/date'
import config from '../config'
import * as intl from 'intl'
global.Intl = intl

export const urls = {
main: {prefix: '', router: MainRouter, urls: {
    '/': {func: 'base', template: 'base', methods: ['get']},
}},
corp_api: {prefix: '/api/corp', router: CorpApiRouter, opt: {json: true}, urls: {
    '/items': {func: 'items', methods: ['get']},
    '/items/:id': {func: 'items', methods: ['get']},
    '/prices': {func: 'prices', methods: ['get']},
    '/orders': {func: 'orders', methods: ['get']},
    '/orders/:id': {func: 'orders', methods: ['get']},
    '/list': {func: 'list', methods: ['get']},
    '/:id': {func: 'corp', methods: ['get']},
}},
ship_api: {prefix: '/api/ship', router: ShipApiRouer, opt: {json: true}, urls: {
    '/list': {func: 'list', methods: ['get']},
    '/:id': {func: 'ship', methods: ['get']},
}},
admin_api: {prefix: '/api/admin', router: AdminApiRouter, opt: {admin: true, json: true}, urls: {
    '/resource/:id': {func: 'resource_change', methods: ['post']},
    '/item/create': {func: 'item_change', methods: ['post']},
    '/item/delete/:id': {func: 'item', methods: ['delete']},
    '/items/': {func: 'items_list', methods: ['get']},
    '/order/create': {func: 'order_change', methods: ['post']},
    '/order/delete/:id': {func: 'order', methods: ['delete']},
    '/orders/': {func: 'orders_list', methods: ['get']},
}},
api: {prefix: '/api', router: ApiRouter, opt: {json: true}, urls: {
    '/profile': {func: 'profile', methods: ['post']},
    '/planet/list': {func: 'planet_list_short', methods: ['get']},
    '/planet/:id': {func: 'planet', methods: ['get']},
    '/planets/': {func: 'planet_list', methods: ['get']},
    '/users/': {func: 'users_list', methods: ['get']},
}},
auth: {prefix: '/auth', router: AuthRouter, urls: {
    '/info': {func: 'info', methods: ['get'], json: true},
    '/login': {func: 'login', template: 'auth/login', name: 'login', json: ['post']},
    '/logout': {func: 'logout', methods: ['get'], no_render: true},
    '/signup': {func: 'signup', json: ['post']},
    '/reset': {func: 'reset'},
    '/forgot': {func: 'forgot'},
    '/oauth/:name': {func: 'oauth', methods: ['get'], no_render: true, name: 'oauth'},
    '/oauth/:name/unlink': {func: 'oauth_unlink', methods: ['get']},
    '/oauth/:name/callback': {func: 'oauth_callback', methods: ['get'], no_render: true,
        chain: [(ctx: RenderContext)=>ctx.returnTo('/')]},
}},
admin: {prefix: '/admin', router: AdminRouter, opt: {admin: true}, urls: {
    '/main': {func: 'index', methods: ['get'], template: 'admin'},
    '/members': {func: 'members', methods: ['get'], template: 'members'},
}},
default: {prefix: '', router: MainRouter, urls: {
    all: {url: /\/.*/, func: 'base', template: 'base', methods: ['get']}
}},
}

export function create(t_ctx: Environment){
    const routers = []
    for (let k in urls){
        const info = urls[k]
        routers.push(new info.router(info.urls, info.prefix, info.opt))
    }
    t_ctx.addGlobal('url', (name, ...args)=>{
        for (let r of routers) {
            const route = r.r.route(name)
            if (route)
                return route.url(...args)
        }
        throw new Error(`Route for args ${JSON.stringify(args)} not found`)
    })
    t_ctx.addGlobal('attribute', (obj, key, def)=>obj && key in obj ? obj[key] : def)
    t_ctx.addFilter('keys', obj=>Object.keys(obj))
    t_ctx.addFilter('datestr', (str, opt)=>{
        opt = opt||{month: 'long', day: 'numeric'}
        const locale = config.locale||'en-US'
        const w = new Intl.DateTimeFormat(locale, opt);
        return w.format(new Date(str));
    })
    return routers
}