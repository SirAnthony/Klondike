import {Entity} from './base';
import {Identifier, PlanetShip, Ship} from '../../client/src/common/entity'
import * as util from '../../client/src/common/util'
import {ObjectId} from 'mongodb';

class ShipDB extends Ship {
    created: Date
    updated: Date
}

export class ShipController extends ShipDB {
    private static DB = new Entity<ShipDB>('ships')
    protected constructor(data, fields=[]){
        super()
        util.obj_copyto(data, this, `_id name class port captain
            owner integrity mass engine speed movement size attack
            defence crew slots modules inventory img`+fields.join(' '))
        return this
    }
    get identifier(): Identifier { return {_id: this._id, name: this.name} }

    get PlanetShip(): PlanetShip {
        return {_id: this._id, name: this.name, class: this.class,
            img: this.img, pos: this.location.pos}
    }

    async save() {
        const data = this as ShipDB
        data.created = data.created || new Date()
        data.updated = new Date()
        return await ShipController.DB.save(data)
    }

    static async get(data: ShipController | ShipDB | Ship | ObjectId | string, fields?){
        if (data instanceof ShipController)
            return data
        if (data instanceof ObjectId || typeof data == 'string')
            data = await ShipController.DB.get(data)
        return new ShipController(data, fields)
    }

    static async find(data, fields?) : Promise<ShipController> {
        const ret = await ShipController.DB.find(data)
        if (ret)
            return new ShipController(ret, fields)
    }

    static async all(filter = {}) : Promise<ShipController[]> {
        const items = await ShipController.DB.list(filter), ret = []
        for (let user of items)
            ret.push(await ShipController.get(user))
        return ret
    }
}