import {Resource, ResourceType, ItemType} from '../client/src/common/entity'
import {ResourceController} from '../src/entity'

export class ResFixture extends Resource {
    constructor(data){
        super()
        for (let key in data)
            this[key] = data[key]
        this.value = 0
        this.owner = null
        this.location = null
    }
}

const resources: ResFixture[] = [new ResFixture({
    name: 'Alloy',
    type: ItemType.Resource,
    kind: ResourceType.Alloy,
    price: 200,
    data: '',
}), new ResFixture({
    name: 'Crystal',
    type: ItemType.Resource,
    kind: ResourceType.Crystal,
    price: 200,
    data: '',
}), new ResFixture({
    name: 'Energy',
    type: ItemType.Resource,
    kind: ResourceType.Energy,
    price: 30,
}), new ResFixture({
    name: 'Gas',
    type: ItemType.Resource,
    kind: ResourceType.Gas,
    price: 200,
    data: '',
}), new ResFixture({
    name: 'Mineral',
    type: ItemType.Resource,
    kind: ResourceType.Mineral,
    price: 200,
    data: '',
}), new ResFixture({
    name: 'Particle',
    type: ItemType.Resource,
    kind: ResourceType.Particle,
    price: 200,
    data: '',
}),]

class ResControllerFixture extends ResourceController {
    constructor(data: Resource) {
        super(data)
    }
}

export const Fixtures = resources

export default async function load() {
    for (let corp of resources) {
        const prev = await ResourceController.find({name: corp.name})
        if (prev) {
            for (let k in corp)
                prev[k] = corp[k]
        }
        const s = prev || new ResControllerFixture(corp)
        await s.save()
    }
}

if (module.parent==undefined)
    load()