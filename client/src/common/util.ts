import config from './config'
import {ApiError} from './errors'
import {Item, ItemType, Resource} from './entity'
import axios from 'axios'

export const url = (path: string)=>{
    let {server} = config
    if (!path.startsWith('/'))
        path = '/'+path
    let host = array_join([server.host, server.port], ':')
    if (host)
        host = `//${host}`
    return `${host}${path}`
}
const get_csrf = ()=>
    (document?.querySelector('meta[name="csrf-token"') as HTMLMetaElement)?.content
const params_csrf = ['delete']
const no_csrf = ['get']
export const wget = async (_url: string, opt?: any)=>{
    let data = Object.assign({redirect: 'follow', method: 'GET'}, opt)
    const method = data.method.toLowerCase()
    if (params_csrf.includes(method))
        data.params = Object.assign({_csrf: get_csrf()}, data.params)
    else if (!no_csrf.includes(method))
        data.data = Object.assign({_csrf: get_csrf()}, data.data)
    try {
        let r = await axios(url(_url), data)
        return {resp: r, code: r.status, data: r.data}
    } catch (e) { 
        const {code, message, response = {}} = e
        const err = ApiError.from(response.data?.err || {
            code, status: response.status||code, message})
        return {err, code}
    }
}
export const capitalize = (str: string)=>str.substring(0, 1).toUpperCase()+str.substring(1)
export const array_join = (arr: any[], sep?: string)=>arr.filter(Boolean).join(sep||' ')
export const obj_copyto = (data: any, target: any, keys?: string | string[])=>{
    if (!data)
        return target
    keys = (keys && (Array.isArray(keys) ? keys : keys.split(/\s+/)) || Object.keys(data))
    keys.filter(k=>k in data).forEach(k=>target[k] = data[k])
    return target
}

export const get_name = (data: any)=>typeof data==='object' ? data.name : data

export const not_depleted = (item: Item)=>{
    return item.type!=ItemType.Resource || (item as Resource).value>0 }

export const isEmpty = (input: string)=>!input && isNaN(+input)
export const isPhone = (input: string)=>
    /^(\+\d{1,3}[-\s]?)?\(?\d{1,4}\)?[-\s]?\d{1,4}[-\s]?\d{1,4}[-\s]?\d{1,4}$/.test(input)