import * as mongodb from '../util/mongodb'
import {ObjectId} from 'mongodb';
import {Identifier, Owner, Institution} from '../../client/src/common/entity'
import * as util from '../../client/src/common/util'

export class Entity<T> {
    name: string
    db: string = "test"
    constructor(db: string) {
        this.db = db
    }
    get asObject(): any { return {...this} }
    async get(id: ObjectId | string): Promise<Awaited<T>> {
        let _id = id instanceof ObjectId ? id : new ObjectId(id)
        let data = await mongodb.find_one(this.db, {_id})
        if (!data)
            throw 'Not found'
        return data
    }
    async find(filter = {}): Promise<Awaited<T>> {
        return await mongodb.find_one(this.db, filter) }
    async list(filter = {}): Promise<Awaited<T[]>> {
        return await mongodb.find_all(this.db, filter) }
    async add(obj: T){
        if (!obj)
            return false
        return await mongodb.insert(this.db, obj)
    }
    async names(obj: any): Promise<Identifier[]> {
        let projection = {_id: 1, name: 1}
        let data = await mongodb.find_all(this.db, {}, {projection})
        return data
    }
    async relation(obj: any){
        let {id, field, action} = obj
        if (!id)
            throw 'No id'
        let data: Identifier = obj.data
        let _id = id instanceof ObjectId ? id : new ObjectId(id)
        let entity = await mongodb.find_one(this.db, {_id}, {_id: 1, [field]: 1})
        let set: Identifier[] = entity[field]
        let idx = set.findIndex(c=>c._id==data._id)
        if (action=='add' && idx<0)
            set.push(data)
        else if (action=='remove' && idx>=0)
            set.splice(idx, 1)
        else
            return false
        return await mongodb.update(this.db, {_id}, {$set: {[field]: set}})
    }
    async save(obj: T) {
        if (!obj)
            return false
        const id: any = (obj as Identifier)._id
        const _id = (!id || id instanceof ObjectId) ? id : new ObjectId(id)
        if (!_id) {
            const ret = await this.add(obj);
            if (ret)
                (obj as Identifier)._id = ret.insertedId.toString()
            return !!ret
        }
        const $set: any = Object.assign({}, obj)
        delete $set._id
        return await mongodb.update(this.db, {_id}, {$set})
    }

    async delete(obj: T) {
        if (!obj)
            return false
        const id: any = (obj as Identifier)._id
        const _id = id instanceof ObjectId ? id : new ObjectId(id)
        if (!_id)
            throw 'Cannot delete entry without id'
        return await mongodb.remove(this.db, {_id})
    }
}

type DBState = {
    created: Date
    updated: Date
} & Identifier
type Constructor = new (...args: any[]) => {} & Identifier;
export function MakeController<TBase extends Constructor>(Base: TBase, db: string){
    type DBBase = DBState & TBase
    return class Controller extends Base {
        private static DB = new Entity<DBBase>(db)
        protected constructor(...args: any[]){
            const [data, fields] = args
            super()
            util.obj_copyto(data, this, fields)
            return this
        }
        get identifier(): Identifier {
            const data = (this as unknown) as DBBase
            return {_id: data._id, name: data.name}
        }
        get asObject(): any { return {...this} }
        get asOwner(): Owner {
            const data = (this as unknown) as Institution
            return Object.assign({type: data.type}, this.identifier)
        }
    
        async save() {
            const data = (this as unknown) as DBBase
            data.created = data.created || new Date()
            data.updated = new Date()
            return await Controller.DB.save(data)
        }
    
        static async get(data: Controller | DBBase | TBase | ObjectId | string, fields?) : Promise<Controller>{
            if (data instanceof Controller)
                return data as Controller
            if (data instanceof ObjectId || typeof data == 'string')
                data = await Controller.DB.get(data)
            return new Controller(data, fields)
        }
    
        static async find(data, fields?) : Promise<Controller> {
            const ret = await Controller.DB.find(data)
            if (ret)
                return new Controller(ret, fields)
        }
    
        static async all(filter = {}) : Promise<Controller[]> {
            const items = await Controller.DB.list(filter), ret = []
            for (let item of items)
                ret.push(await Controller.get(item))
            return ret
        }
    }
}