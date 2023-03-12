import * as bcrypt from 'bcrypt'
import {Entity} from './base';
import {Identifier, User, UserType} from '../../client/src/common/entity'
import * as util from '../../client/src/common/util'
import * as sutil from '../util/util'
import { ObjectId } from 'mongodb';

export type AuthToken = {token: string, ts: Date}

class UserDB extends User {
    _id?: string
    password: string
    created: Date
    updated: Date
    reset_token: string
    reset_expires: Date
    google: string
    vkontakte: number
    tokens: {string: AuthToken}
}

type VKArrayItem = {
    type?: string
    value: string
}
export type VKProfile = {
    displayName: string
    emails: VKArrayItem[]
    gender: string
    id: number
    name: {
        familyName: string
        givenName: string
    }
    photos: VKArrayItem[]
    profileUrl: string
    username: string
}

export class Controller extends UserDB {
    private static DB = new Entity<UserDB>('users')

    protected constructor(data, fields?){
        super()
        util.obj_copyto(data, this, fields)
        this.type = this.type||UserType.None
        return this
    }
    get identifier(): Identifier { return {_id: this._id, name: this.name} }

    async save() {
        const data = this as UserDB
        data.created = data.created || new Date()
        data.updated = new Date()
        return await Controller.DB.save(data)
    }

    static async hash_password(password){
        return await bcrypt.hash(password, 10)
    }

    async check_pass(password){
        if (this.password)
            return await bcrypt.compare(password, this.password)
    }

    // Encrypts password
    static async fromObj(obj: any){
        const u = new Controller(obj)
        u.password = await Controller.hash_password(obj.password)
        return u
    }

    static async get(data: Controller | UserDB | User | ObjectId | string, fields?){
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

    static fromVK(obj: VKProfile){
        const email = sutil.clear_email(obj.emails[0].value)
        const u = new Controller({
            email, 
            first_name: obj.name.givenName,
            last_name: obj.name.familyName,
            alias: obj.username
        })
        u.vkontakte = obj.id
        return u
    } 
}