import * as fs from 'fs/promises'
import { ItemType, Owner, PlanetType, Resource, ResourceType } from '../client/src/common/entity'
import { ItemController, PlanetController } from '../src/entity'

type DataRow = [string, string, string]

async function load_cvs(filename) : Promise<DataRow[]> {
    const data = (await fs.readFile(filename)).toString()
    const lines = data.split('\n')
    // Remove title
    lines.shift()
    return lines.map(l=>l.split(',') as DataRow)
}

function getPlanetType(name: string) : PlanetType {
    switch (name){
    case 'Icy': return PlanetType.Frost
    case 'Rocky': return PlanetType.Rocky
    case 'Bio': return PlanetType.Jungle
    case 'Molten': return PlanetType.Molten
    }
    throw 'Not found'
}

const Planets = {}
async function getPlanet(type: PlanetType) : Promise<Owner> {
    if (type in Planets)
        return Planets[type]
    const controller = await PlanetController.find({type})
    return Planets[type] = controller.asOwner
}

type ImportRes = Omit<Resource, 'keys' | 'class'>
async function loadRow(idx: number, row: DataRow) : Promise<ImportRes> {
    const [t, p, v] : [string, string, string] = row
    const kind: ResourceType = +t
    const planet = getPlanetType(p)
    const value: number = +v
    const location = {system: '', pos: {col: 0, row: 0},
        ...(await getPlanet(planet))}
    const name = `R-3${kind}586${idx}`
    return {type: ItemType.Resource, kind, value,
        location, owner: null, price: 0, data: '', name}
}

async function load(){
    const data = await load_cvs('res.csv')
    const resources = [] as ImportRes[]
    for (let i=0; i<data.length; ++i)
        resources.push(await loadRow(i, data[i]))
    for (let res of resources){
        const obj = await ItemController.find({name: res.name}) ||
            await ItemController.get(res as any)
        for (let k in res)
            obj[k] = res[k]
        await obj.save()
    }
    process.exit(0)
}

if (module.parent==undefined)
    load()