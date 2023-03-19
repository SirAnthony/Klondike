import {User, UserType} from '../client/src/common/entity'
import {UserController} from '../src/entity/index'

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
    type: UserType.Master,
}), new UserFixture({
    name: 'Captain',
    alias: 'Cpt',
    first_name: 'Captain',
    last_name: 'Brave',
    type: UserType.Captain,
}), new UserFixture({
    name: 'Corporant',
    alias: 'Corp',
    first_name: 'Rat',
    last_name: 'Fisher',
    type: UserType.Corporant,
}), new UserFixture({
    name: 'Guard',
    alias: 'Steely',
    first_name: 'Iron',
    last_name: 'Brow',
    type: UserType.Guard,
}), new UserFixture({
    name: 'Mechanic',
    alias: 'Mech',
    first_name: 'Peter',
    last_name: 'Moons',
    type: UserType.Mechanic,
}), new UserFixture({
    name: 'Navigator',
    alias: 'Baldy',
    first_name: 'Blue',
    last_name: 'Eyes',
    type: UserType.Navigator,
}), new UserFixture({
    name: 'Scientist',
    alias: 'Bighead',
    first_name: 'Gordon',
    last_name: 'Bondman',
    type: UserType.Scientist,
}), new UserFixture({
    name: 'Nobody',
    alias: 'Nobody',
    first_name: 'John',
    last_name: 'Doe',
    type: UserType.None,
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
        await s.save()
    }
}

if (module.parent==undefined)
    load()