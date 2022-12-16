import * as mongodb from '../util/mongodb'
import {ObjectId} from 'mongodb';
import {Identifier} from '../../client/src/common/entity'

export class Entity<T> {
    name: string
    db: string = "test"
    constructor(db: string) {
        this.db = db
    }
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
        const _id = id instanceof ObjectId ? id : new ObjectId(id)
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
