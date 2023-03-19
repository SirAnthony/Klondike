import {Planet, PlanetType} from '../client/src/common/entity'
import {PlanetController} from '../src/entity/index'

export class PlanetFixture extends Planet {
}

const planets: PlanetFixture[] = [{
    name: 'Glaciem',
    type: PlanetType.Frost,
    zones: [{center: {col: 16, row: 10}, radius: 8}],
    data: 'Desolate ice planet, perpetually frozen in sub-zero temperatures with treacherous crevasses and ice storms',
    system: '',
}, {
    name: 'Cryosia',
    type: PlanetType.FrostSat,
    zones: [{center: {col: 5, row: 5}, radius: 3}, {center: {col: 10, row: 12}, radius: 7}],
    data: 'Frozen wasteland, surrounded by a small, barren satellite with frigid temperatures and scarce resources',
    system: '',
}, {
    name: 'Infernus',
    type: PlanetType.Molten,
    zones: [{center: {col: 16, row: 9}, radius: 8}],
    data: 'Fiery inferno, its surface covered in molten lava with unbearable temperatures that require protective gear to survive',
    system: '',
}, {
    name: 'Verdantia',
    type: PlanetType.Jungle,
    zones: [{center: {col: 16, row: 10}, radius: 8}],
    data: 'Lush, tropical planet with dense jungles, teeming with exotic flora and fauna.',
    system: '',
}, {
    name: 'Aether',
    type: PlanetType.Rocky,
    zones: [{center: {col: 16, row: 10}, radius: 8}],
    data: 'lifeless world, a barren rock floating in space with a thin, tenuous atmosphere',
    system: '',
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