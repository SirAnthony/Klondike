import {Entity} from './base';
import {Identifier, Corporation} from '../../client/src/common/entity'
import * as util from '../../client/src/common/util'
import {ObjectId} from 'mongodb';

class CorporationDB extends Corporation {
    created: Date
    updated: Date
}

export class CorpController extends CorporationDB {
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
        return await CorpController.DB.save(data)
    }

    static async get(data: CorpController | CorporationDB | Corporation | ObjectId | string, fields?){
        if (data instanceof CorpController)
            return data
        if (data instanceof ObjectId || typeof data == 'string')
            data = await CorpController.DB.get(data)
        return new CorpController(data, fields)
    }

    static async find(data, fields?) : Promise<CorpController> {
        const ret = await CorpController.DB.find(data)
        if (ret)
            return new CorpController(ret, fields)
    }

    static async all(filter = {}) : Promise<CorpController[]> {
        const items = await CorpController.DB.list(filter), ret = []
        for (let item of items)
            ret.push(await CorpController.get(item))
        return ret
    }
}