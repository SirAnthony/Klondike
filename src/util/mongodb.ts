
import * as _ from 'lodash'
import * as cookie from 'cookie'
import * as util from 'util'
import * as mongo from 'mongodb'
import config from '../config'
import * as sutil from './util'

let open_conns = new Map()
let __conn: {[name: string]: DB} = {}

export interface DB {
    name: string,
    collection: mongo.Collection,
    db: mongo.Db,
    client: mongo.MongoClient,
    opt: any,
    host: string,
    port: number,
    conn: string
}

interface MCursor<T> extends mongo.FindCursor<T> {
    selector: mongo.Filter<T>,
    _cdb: DB,
}


// TODO: use logger
const LOG = (str: String, ...args)=>console.log(util.format(str, ...args))
const ERR = (str: String, ...args)=>console.error(util.format(str, ...args))

function err_handler(db: DB, type: string, err: Error, selector: any, update? : any){
    ERR('MONGO_ERR: cmd: %s selector: %O\n update: %O\n%s\n%s',
        type, selector, update, err.message, err.stack)
    throw err
}

function log_query(query: string, name: string, selector: any, update: any, res: any){
    if (!config.debug || !config.debug.db)
        return
    LOG('mongodb %s db %s selector: %O, update: %O, res: %O', query,
        name, selector, update, (res && res.result) || res);
}

function _clean_void(obj){
    let stack = [obj];
    while (stack.length){
        let val = stack.pop();
        if (Array.isArray(val)){
            for (let item of val){
                if (item!=null&&typeof item=='object')
                    stack.push(item);
            }
        } else {
            for (let k in val){
                let item = val[k];
                if (item===undefined)
                    delete val[k];
                else if (item!=null&&typeof item=='object')
                    stack.push(item);
            }
        }
    }
    return obj;
}

async function check_db(db: DB | string) : Promise<DB> {
    if (typeof db=='string')
        return await open(db as string)
    return db
}

export async function open(name: Array<string>, conn_str?: string) : Promise<DB[]>
export async function open(name: string, conn_str?: string) : Promise<DB>
export async function open(name, conn_str?) : Promise<any> {
    if (Array.isArray(name))
    {
        let ret: DB[] = []
        for (let n of name)
            ret.push(await open(n as string, conn_str))
        return ret
    }
    if (__conn[name])
        return __conn[name]
    conn_str = conn_str||config.db.conn
    return __conn[name] = await connect(conn_str, name)
}

export async function find_one(db: DB | string, selector, _opt: any = {}){
    if (typeof db=='string')
        db = await open(db as string)
    selector = selector||{}
    const read_preference = _opt.read_preference
    let opt = !_opt ? {} : _.omit(_opt, 'read_preference')
    if (read_preference)
        opt.readPreference = new mongo.ReadPreference(read_preference)
    return await try_mongo(db, 'findOne', selector, opt)
}

export async function find_all(db: DB | string, selector = {}, opt: any = {}){
    if (typeof db=='string')
        db = await open(db as string)
    let cursor = db.collection.find(selector);
    if (opt.hint)
        cursor.hint(opt.hint);
    if (opt.projection)
        cursor.project(opt.projection);
    if (opt.sort)
        cursor.sort(opt.sort);
    if (opt.limit)
        cursor.limit(opt.limit);
    if (opt.skip)
        cursor.skip(opt.skip);
    let items;
    try { items = await cursor.toArray(); }
    catch(e){ err_handler(db, 'toArray', e, {selector, opt}); }
    log_query('toArray', db.name, {selector, opt}, null, items);
    return items;
}

export function find(db: DB | string, selector: mongo.Filter<any> = {}, opt?: mongo.FindOptions){
    if (typeof db=='string')
        throw new Error('Cannot open db from mongodb.find')
    let cursor = db.collection.find(selector, opt) as MCursor<any>
    cursor.selector = selector
    cursor._cdb = db
    return cursor
}

async function try_mongo(db: DB, cmd, selector?, update?, ...args){
    let res
    try { res = await db.collection[cmd](selector, update, ...args) }
    catch(e){ err_handler(db, cmd, e, selector, update) }
    log_query(cmd, db.name, selector, update, res)
    return res
}

export async function update(db: DB | string, selector, update, opt: any = {upsert: true}){
    db = await check_db(db)
    selector = selector||{}
    if (opt.del_undef)
        _clean_void(update)
    return await try_mongo(db, 'update', selector, update, opt)
}

export async function insert_many(db: DB | string, obj): Promise<mongo.InsertManyResult<any>> {
    db = await check_db(db)
    let res = await try_mongo(db, 'insertMany', obj);
    return res._id;
}

export async function insert(db: DB | string, obj, opt: any = {}): Promise<mongo.InsertOneResult<any>> {
    db = await check_db(db)
    if (opt.del_undef)
        _clean_void(obj)
    return await try_mongo(db, 'insertOne', obj)
}

export async function remove(db: DB | string, selector={}){
    db = await check_db(db)
    return await try_mongo(db, 'deleteOne', selector)
}

export async function count(db: DB | string, selector={}){
    db = await check_db(db)
    return await try_mongo(db, 'count', selector)
}

export async function disconnect(db : DB | string){
    db = await check_db(db)
    return await db.client.close()
}

async function connect(conn: string | any, collection: string){
    const opt = Object.assign({host: 'localhost', port: 27017},
        conn instanceof Object ? conn : cookie.parse(conn||''))
    let ret: DB = Object.assign({}, opt);
    let hosts = opt.host+':'+opt.port, host
    for (let i=1; (host = opt['host'+i]); i++)
        hosts += ','+host+':'+(opt['port'+i]||'27017')
    let url_opts = {}
    const url_opts_keys = ['w', 'maxPoolSize', 'readPreference', 'replicaSet']
    for (let k of url_opts_keys)
        url_opts[k] = opt[k]
    const url = sutil.uri('mongodb://'+hosts+'/'+opt.db, url_opts)
    let config: mongo.MongoClientOptions = {
        connectTimeoutMS: +opt.connect_timeout_ms||90000,
        serverSelectionTimeoutMS: +opt.connect_timeout_ms||90000,
        socketTimeoutMS: 24*3600000,
        keepAlive: true,
    }
    try {
        ret.client = await mongo.MongoClient.connect(url, config)
        ret.db = ret.client.db()
    } catch(e){
        ERR('Failed opening db %s/%s %s\n%s', opt.db, collection, e.message,
            e.stack)
        throw e
    }
    // handle disconnect
    ret.client.on('close', ()=>open_conns.delete(ret.db))
    open_conns.set(ret.db, Object.assign({collection}, opt))
    if (collection===undefined)
        return ret
    try { ret.collection = await ret.db.collection(collection) }
    catch(e){
        ERR('Failed opening collection %s/%s %s\n%s', opt.db, collection,
            e.message, e.stack)
        throw e
    }
    LOG('opened collection %s', collection)
    ret.name = opt.db+':'+collection
    return ret
}

async function ensure_index(db: DB | string, collection: string, index: string, opt: mongo.CreateIndexesOptions = {}){
    db = await check_db(db)
    return await db.db.createIndex(collection, index, opt)
}

export async function create_collection(db: DB | string, collection: string, indexes?: Array<string>, opt?: mongo.CreateCollectionOptions){
    db = await check_db(db)
    const col = await db.db.createCollection(collection, opt)
    if (!indexes)
        return col
    for (let idx of indexes)
        await ensure_index(db, collection, idx)
    return col
}

export async function drop_collection(db: DB | string){
    db = await check_db(db)
    return await try_mongo(db, 'drop')
}
