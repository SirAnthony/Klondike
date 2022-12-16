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

export class UserController extends UserDB {
    private static DB = new Entity<UserDB>('users')

    private constructor(data, fields=[]){
        super()
        util.obj_copyto(data, this, `_id first_name second_name last_name
            alias email age phone admin credit debt type tokens `+
            fields.join(' '))
        this.age = this.age|0
        this.type = this.type||UserType.Base
        return this
    }
    get identifier(): Identifier { return {_id: this._id} }

    async save() {
        const data = this as UserDB
        data.created = data.created || new Date()
        data.updated = new Date()
        return await UserController.DB.save(data)
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
        const u = new UserController(obj)
        u.password = await UserController.hash_password(obj.password)
        return u
    }

    static async get(data: UserController | UserDB | User | ObjectId | string, fields?){
        if (data instanceof UserController)
            return data
        if (data instanceof ObjectId || typeof data == 'string')
            data = await UserController.DB.get(data)
        return new UserController(data, fields)
    }

    static async find(data, fields?) : Promise<UserController> {
        const ret = await UserController.DB.find(data)
        if (ret)
            return new UserController(ret, fields)
    }

    static async all(filter = {}) : Promise<UserController[]> {
        const items = await UserController.DB.list(filter), ret = []
        for (let user of items)
            ret.push(await UserController.get(user))
        return ret
    }

    static fromVK(obj: VKProfile){
        const email = sutil.clear_email(obj.emails[0].value)
        const u = new UserController({
            email, 
            first_name: obj.name.givenName,
            last_name: obj.name.familyName,
            alias: obj.username
        })
        u.gender = obj.gender
        u.vkontakte = obj.id
        return u
    } 
}