import {Entity} from './base';
import {Identifier, Corporation} from '../../client/src/common/entity'
import * as util from '../../client/src/common/util'
import {ObjectId} from 'mongodb';

class CorporationDB extends Corporation {
    created: Date
    updated: Date
}

export class Controller extends CorporationDB {
    private static DB = new Entity<CorporationDB>('corps')
    protected constructor(data, fields?){
        super()
        util.obj_copyto(data, this, fields)
        return this
    }
    get identifier(): Identifier { return {_id: this._id, name: this.name} }

    async save() {
        const data = this as CorporationDB
        data.created = data.created || new Date()
        data.updated = new Date()
        return await Controller.DB.save(data)
    }

    static async get(data: Controller | CorporationDB | Corporation | ObjectId | string, fields?){
        if (data instanceof Controller)
            return data
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