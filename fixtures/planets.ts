import {Planet, PlanetType} from '../client/src/common/entity'
import {PlanetController} from '../src/entity/index'

export class PlanetFixture extends Planet {
}

const planets: PlanetFixture[] = [{
    name: 'Planet 1',
    type: PlanetType.Frost,
    zones: [{center: {col: 16, row: 10}, radius: 8}],
    resources: [],
}, {
    name: 'Planet 2',
    type: PlanetType.FrostSat,
    zones: [{center: {col: 5, row: 5}, radius: 3}, {center: {col: 10, row: 12}, radius: 7}],
    resources: [],
}, {
    name: 'Planet 3',
    type: PlanetType.Molten,
    zones: [{center: {col: 16, row: 9}, radius: 8}],
    resources: [],
}, {
    name: 'Planet 4',
    type: PlanetType.Jungle,
    zones: [{center: {col: 16, row: 10}, radius: 8}],
    resources: [],
}, {
    name: 'Planet 5',
    type: PlanetType.Rocky,
    zones: [{center: {col: 16, row: 10}, radius: 8}],
    resources: [],
},]

class PlanetControllerFixture extends PlanetController {
    constructor(data: Planet) {
        super(data)
    }
}

export const Fixtures = planets

export default async function load() {
    for (let planet of planets) {
        const prev = await PlanetController.find({name: planet.name})
        if (prev) {
            for (let k in planet)
                prev[k] = planet[k]
        }
        const s = prev || new PlanetControllerFixture(planet)
        await s.save()
    }
}

if (module.parent==undefined)
    load()