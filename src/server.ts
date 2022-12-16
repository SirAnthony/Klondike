import 'reflect-metadata';
import * as Koa from 'koa'
import * as middlewares from './middlewares'
import * as urls from './urls'
import config from './config'
import merge = require('lodash.merge')

process.on('unhandledRejection', (reason: any, promise: Promise<any>)=>
    console.error(reason))

export let server;
export async function run(opt: any = {}){
    const conf = merge({server: {port: +process.env.PORT||3000}}, config, opt)
    const {port} = conf.server
    const app = new Koa()
    middlewares.load(app, conf)
    const routers = urls.create(middlewares.NJ)
    for (let r of routers)
        app.use(r.routes()).use(r.methods())
    server = await app.listen(port)
    console.log(`Server running on port ${port}`)
    return server
}
export function stop(){
    server.close()
}

if (module.parent==undefined)
    run()
