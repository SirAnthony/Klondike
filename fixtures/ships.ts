import {Corporation, Ship, ShipClass, ItemType} from '../client/src/common/entity'
import {ShipController, CorpController} from '../src/entity/index'
import {CorpAlias, Fixtures as CorpFixtures} from './corps'

class ShipFixture extends Ship {
    constructor(data){
        super()
        Object.assign(this, {kind: ShipClass.D, integrity: 100,
            mass: 100, engine: 100, speed: 1, movement: 1, size: 1,
            attack: 1, defence: 1, crew: 3, slots: 4, modules: [],
            inventory: [], price: 20000, round_cost: 20000,
            location: null}, data)
    }
}

const ships: ShipFixture[] = [new ShipFixture({
    type: ItemType.Ship,
    name: 'Солнечная виверна',
    port: '',
    captain: {_id: '', name: ''},
    owner: {_id: '', name: CorpAlias.AP},
}), new ShipFixture({
    type: ItemType.Ship,
    name: 'Красная королева',
    port: '',
    captain: {_id: '', name: ''},
    owner: {_id: '', name: CorpAlias.AP},
}), new ShipFixture({
    type: ItemType.Ship,
    name: 'нет 3',
    port: '',
    captain: {_id: '', name: ''},
    owner: {_id: '', name: CorpAlias.AP},
}), new ShipFixture({
    type: ItemType.Ship,
    name: 'Милость богини Кали',
    port: '',
    captain: {_id: '', name: ''},
    owner: {_id: '', name: CorpAlias.AP},
}), new ShipFixture({
    type: ItemType.Ship,
    name: 'Мустанг',
    port: '',
    captain: {_id: '', name: ''},
    owner: {_id: '', name: CorpAlias.AP},
}), new ShipFixture({
    type: ItemType.Ship,
    name: 'нет 6',
    port: '',
    captain: {_id: '', name: ''},
    owner: {_id: '', name: CorpAlias.AP},
}), new ShipFixture({
    type: ItemType.Ship,
    name: 'Бойкот',
    port: '',
    captain: {_id: '', name: ''},
    owner: {_id: '', name: CorpAlias.AP},
}), new ShipFixture({
    type: ItemType.Ship,
    name: 'нет 8',
    port: '',
    captain: {_id: '', name: ''},
    owner: {_id: '', name: CorpAlias.AP},
}), new ShipFixture({
    type: ItemType.Ship,
    name: 'Sanctuary',
    port: '',
    captain: {_id: '', name: ''},
    owner: {_id: '', name: CorpAlias.AP},
}), new ShipFixture({
    type: ItemType.Ship,
    name: 'Honeybadger',
    port: '',
    captain: {_id: '', name: ''},
    owner: {_id: '', name: CorpAlias.AP},
}), new ShipFixture({
    type: ItemType.Ship,
    name: 'Черная Птица',
    port: '',
    captain: {_id: '', name: ''},
    owner: {_id: '', name: CorpAlias.AP},
}), new ShipFixture({
    type: ItemType.Ship,
    name: 'нет 12',
    port: '',
    captain: {_id: '', name: ''},
    owner: {_id: '', name: CorpAlias.AP},
}), new ShipFixture({
    type: ItemType.Ship,
    name: 'Корабль 13',
    port: '',
    captain: {_id: '', name: ''},
    owner: {_id: '', name: CorpAlias.AP},
}), new ShipFixture({
    type: ItemType.Ship,
    name: 'ZX326 "Валера"',
    port: '',
    captain: {_id: '', name: ''},
    owner: {_id: '', name: CorpAlias.AP},
}),]

class ShipControllerFixture extends ShipController {
    constructor(data: Ship) {
        super(data)
    }
}

export default async function load() {
    const corps: {[name: string]: Corporation} = {}
    let counter = 0;
    for (let ship of ships) {
        const oname = ship.owner?.name || ''
        let corp = corps[oname] || (corps[oname] = await CorpController.find({
            name: CorpFixtures.find(f=>f.alias==oname)?.name}))
        ship.owner = {_id: corp._id, name: corp.name}
        const prev = await ShipController.find({name: ship.name})
        if (prev) {
            for (let k in ship)
                prev[k] = ship[k]
        }
        const s = prev || new ShipControllerFixture(ship)
        s.img = '' + ++counter
        await s.save()
    }
}

if (module.parent==undefined)
    load()
