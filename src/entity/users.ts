import * as bcrypt from 'bcrypt'
import {Entity, MakeController} from './base';
import {institutionController} from '.';
import {Identifier, Owner, User, UserType} from '../../client/src/common/entity'
import * as util from '../../client/src/common/util'
import * as sutil from '../util/util'
import * as uutil from '../util/user'
import {ObjectId} from 'mongodb';

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

export class Controller extends MakeController(UserDB, 'users') {
    protected constructor(data, fields?){
        super(data, fields)
        this.kind = this.kind||UserType.None
        return this
    }

    async save() {
        this.info = await uutil.process_data(this.data)
        return await super.save()
    }

    static async hash_password(password){
        return await bcrypt.hash(password, 10)
    }

    static async check_password(user: Controller, password){
        if (user.password)
            return await bcrypt.compare(password, user.password)
    }

    // Encrypts password
    static async fromObj(obj: any){
        const u = new Controller(obj)
        u.password = await Controller.hash_password(obj.password)
        if (u.relation){
            const ctrl = institutionController(u.relation.type)
            u.relation = (await ctrl.get(u.relation._id)).asOwner
        }
        return u
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