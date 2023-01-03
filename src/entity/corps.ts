import {Entity} from './base';
import {Identifier, Corporation} from '../../client/src/common/entity'
import * as util from '../../client/src/common/util'
import {ObjectId} from 'mongodb';

class CorporationDB extends Corporation {
    created: Date
    updated: Date
}

export class CorporationController extends CorporationDB {
    private static DB = new Entity<CorporationDB>('corps')
    protected constructor(data, fields=[]){
        super()
        util.obj_copyto(data, this, `_id name`+fields.join(' '))
        return this
    }
    get identifier(): Identifier { return {_id: this._id, name: this.name} }

    async save() {
        const data = this as CorporationDB
        data.created = data.created || new Date()
        data.updated = new Date()
        return await CorporationController.DB.save(data)
    }

    static async get(data: CorporationController | CorporationDB | Corporation | ObjectId | string, fields?){
        if (data instanceof CorporationController)
            return data
        if (data instanceof ObjectId || typeof data == 'string')
            data = await CorporationController.DB.get(data)
        return new CorporationController(data, fields)
    }

    static async find(data, fields?) : Promise<CorporationController> {
        const ret = await CorporationController.DB.find(data)
        if (ret)
            return new CorporationController(ret, fields)
    }

    static async all(filter = {}) : Promise<CorporationController[]> {
        const items = await CorporationController.DB.list(filter), ret = []
        for (let user of items)
            ret.push(await CorporationController.get(user))
        return ret
    }
}