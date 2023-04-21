import * as mongodb from '../util/mongodb'
import * as util from '../../client/src/common/util'
import {Config} from '../../client/src/common/config'

const TABLE_NAME = 'config'

export class Controller {
    static db = "config"
    static cache: any
    static async get() : Promise<Config> {
        if (Controller.cache)
            return Controller.cache
        let data = await mongodb.find_one(Controller.db,
            {name: TABLE_NAME})
        if (!data)
            throw 'Not found'
        return Controller.cache = data
    }
    static async save(obj){
        const $set = Object.assign({}, obj)
        $set.name = TABLE_NAME
        delete $set._id
        Controller.cache = $set
        return await mongodb.update(Controller.db,
            {name: TABLE_NAME}, {$set})
    }
    static async create(){
        return await mongodb.create_collection(Controller.db, Controller.db)
    }
}