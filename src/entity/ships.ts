import {Entity} from './base';
import {Identifier, PlanetShip, Ship} from '../../client/src/common/entity'
import * as util from '../../client/src/common/util'
import {ObjectId} from 'mongodb';

class ShipDB extends Ship {
    created: Date
    updated: Date
}

export class Controller extends ShipDB {
    private static DB = new Entity<ShipDB>('ships')
    protected constructor(data, fields?){
        super()
        util.obj_copyto(data, this, fields)
        return this
    }
    get identifier(): Identifier { return {_id: this._id, name: this.name} }

    get PlanetShip(): PlanetShip {
        return {_id: this._id, name: this.name, class: this.kind,
            img: this.img, pos: this.location.pos}
    }

    async save() {
        const data = this as ShipDB
        data.created = data.created || new Date()
        data.updated = new Date()
        return await Controller.DB.save(data)
    }

    static async get(data: Controller | ShipDB | Ship | ObjectId | string, fields?){
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
        for (let user of items)
            ret.push(await Controller.get(user))
        return ret
    }
}