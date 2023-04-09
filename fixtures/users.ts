import {User, InstitutionType, UserType} from '../client/src/common/entity'
import {CorpController, ShipController, UserController} from '../src/entity/index'

export class UserFixture extends User {
    constructor(data){
        super()
        for (let key in data)
            this[key] = data[key]
    }
}

const users: User[] = [new UserFixture({
    name: 'Master',
    alias: 'Master',
    first_name: 'Mas',
    last_name: 'ter',
    kind: UserType.Master,
}), new UserFixture({
    name: 'Captain',
    alias: 'Cpt',
    first_name: 'Captain',
    last_name: 'Brave',
    kind: UserType.Captain,
    relation: {type: InstitutionType.Ship, entity: 'Солнечная виверна'}
}), new UserFixture({
    name: 'Corporant',
    alias: 'Corp',
    first_name: 'Rat',
    last_name: 'Fisher',
    kind: UserType.Corporant,
    relation: {type: InstitutionType.Corporation, entity: 'Amalgam Pharmaceuticals'}
}), new UserFixture({
    name: 'Rakuzant',
    alias: 'Raku',
    first_name: 'Rat',
    last_name: 'Fisher',
    kind: UserType.Corporant,
    relation: {type: InstitutionType.Corporation, entity: 'Rakuza'}
}), new UserFixture({
    name: 'Guard',
    alias: 'Steely',
    first_name: 'Iron',
    last_name: 'Brow',
    kind: UserType.Guard,
}), new UserFixture({
    name: 'Mechanic',
    alias: 'Mech',
    first_name: 'Peter',
    last_name: 'Moons',
    kind: UserType.Mechanic,
    relation: {type: InstitutionType.Ship, entity: 'Солнечная виверна'}
}), new UserFixture({
    name: 'Navigator',
    alias: 'Baldy',
    first_name: 'Blue',
    last_name: 'Eyes',
    kind: UserType.Navigator,
    relation: {type: InstitutionType.Ship, entity: 'Солнечная виверна'}
}), new UserFixture({
    name: 'Scientist',
    alias: 'Bighead',
    first_name: 'Gordon',
    last_name: 'Bondman',
    kind: UserType.Scientist,
    relation: {type: InstitutionType.Corporation, entity: 'Земная федерация'}
}), new UserFixture({
    name: 'Nobody',
    alias: 'Nobody',
    first_name: 'John',
    last_name: 'Doe',
    kind: UserType.None,
})]

class UserControllerFixture extends UserController {
    constructor(data: User) {
        super(data)
    }
}

export const Fixtures = users

export default async function load() {
    for (let user of users) {
        const prev = await UserController.find({name: user.name})
        if (prev) {
            for (let k in user)
                prev[k] = user[k]
        }
        const s = prev || new UserControllerFixture(user)
        s.email = s.name.toLowerCase().replace(/[^\w]+/g, '')+'@klondike.fed'
        s.password = await UserController.hash_password(s.email)
        if (s.relation){
            const controller = s.relation.type==InstitutionType.Corporation ?
                CorpController : ShipController
            s.relation.entity = (await controller.find({name: s.relation.entity})).identifier
        }
        await s.save()
    }
}

if (module.parent==undefined)
    load()