import {Entity} from './base';
import {Identifier, Planet} from '../../client/src/common/entity'
import * as util from '../../client/src/common/util'
import {ObjectId} from 'mongodb';

class PlanetDB extends Planet {
    created: Date
    updated: Date
}

export class PlanetController extends PlanetDB {
    private static DB = new Entity<PlanetDB>('planets')
    protected constructor(data, fields?){
        super()
        util.obj_copyto(data, this, fields)
        return this
    }
    get identifier(): Identifier { return {_id: this._id, name: this.name} }

    async save() {
        const data = this as PlanetDB
        data.created = data.created || new Date()
        data.updated = new Date()
        return await PlanetController.DB.save(data)
    }

    static async get(data: PlanetController | PlanetDB | Planet | ObjectId | string, fields?){
        if (data instanceof PlanetController)
            return data
        if (data instanceof ObjectId || typeof data == 'string')
            data = await PlanetController.DB.get(data)
        return new PlanetController(data, fields)
    }

    static async find(data, fields?) : Promise<PlanetController> {
        const ret = await PlanetController.DB.find(data)
        if (ret)
            return new PlanetController(ret, fields)
    }

    static async all(filter = {}) : Promise<PlanetController[]> {
        const items = await PlanetController.DB.list(filter), ret = []
        for (let item of items)
            ret.push(await PlanetController.get(item))
        return ret
    }
}