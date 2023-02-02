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
    email: 'master@klondike',
    alias: 'Master',
    first_name: 'Mas',
    last_name: 'ter',
    type: UserType.Master,
}), new UserFixture({
    name: 'Captain',
    email: 'captain@klondike',
    alias: 'Cpt',
    first_name: 'Captain',
    last_name: 'Brave',
    type: UserType.Captain,
}), new UserFixture({
    name: 'Corporant',
    email: 'corporant@klondike',
    alias: 'Corp',
    first_name: 'Rat',
    last_name: 'Fisher',
    type: UserType.Corporant,
}), new UserFixture({
    name: 'Guard',
    email: 'guard@klondike',
    alias: 'Steely',
    first_name: 'Iron',
    last_name: 'Brow',
    type: UserType.Guard,
}), new UserFixture({
    name: 'Mechanic',
    email: 'mechanic@klondike',
    alias: 'Mech',
    first_name: 'Peter',
    last_name: 'Moons',
    type: UserType.Mechanic,
}), new UserFixture({
    name: 'Navigator',
    email: 'navigator@klondike',
    alias: 'Baldy',
    first_name: 'Blue',
    last_name: 'Eyes',
    type: UserType.Navigator,
}), new UserFixture({
    name: 'Scientist',
    email: 'scientist@klondike',
    alias: 'Master',
    first_name: 'Gordon',
    last_name: 'Bondman',
    type: UserType.Scientist,
}), new UserFixture({
    name: 'Nobody',
    email: 'nobody@klondike',
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
    for (let planet of users) {
        const prev = await UserController.find({name: planet.name})
        if (prev) {
            for (let k in planet)
                prev[k] = planet[k]
        }
        const s = prev || new UserControllerFixture(planet)
        await s.save()
    }
}

if (module.parent==undefined)
    load()