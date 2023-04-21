import {Corporation, InstitutionType, ResourceSpecialityType, ResourceType} from '../client/src/common/entity'
import {CorpController} from '../src/entity'

export enum CorpAlias {AP = 'AP', R = 'R', WY = 'WY', USC = 'USC', EF = 'EF'}
export class CorpFixture extends Corporation {
    alias: CorpAlias
    constructor(data){
        super()
        for (let key in data)
            this[key] = data[key]
        this.credit = 25000
    }
}

const corps: CorpFixture[] = [new CorpFixture({
    name: 'Amalgam Pharmaceuticals',
    alias: CorpAlias.AP,
    type: InstitutionType.Corporation,
    points: [],
    resourceValue: {
        [ResourceType.Alloy]: ResourceSpecialityType.Special,
        [ResourceType.Crystal]: ResourceSpecialityType.Special,
        [ResourceType.Energy]: ResourceSpecialityType.Common,
        [ResourceType.Gas]: ResourceSpecialityType.Profile,
        [ResourceType.Mineral]: ResourceSpecialityType.Common,
        [ResourceType.Particle]: ResourceSpecialityType.Profile,
    },
}), new CorpFixture({
    name: 'Rakuza',
    alias: CorpAlias.R,
    type: InstitutionType.Corporation,
    points: [],
    resourceValue: {
        [ResourceType.Alloy]: ResourceSpecialityType.Special,
        [ResourceType.Crystal]: ResourceSpecialityType.Profile,
        [ResourceType.Energy]: ResourceSpecialityType.Common,
        [ResourceType.Gas]: ResourceSpecialityType.Profile,
        [ResourceType.Mineral]: ResourceSpecialityType.Common,
        [ResourceType.Particle]: ResourceSpecialityType.Special,
    },
}), new CorpFixture({
    name: 'Wayne-Yuanti',
    alias: CorpAlias.WY,
    type: InstitutionType.Corporation,
    points: [],
    resourceValue: {
        [ResourceType.Alloy]: ResourceSpecialityType.Profile,
        [ResourceType.Crystal]: ResourceSpecialityType.Profile,
        [ResourceType.Energy]: ResourceSpecialityType.Common,
        [ResourceType.Gas]: ResourceSpecialityType.Special,
        [ResourceType.Mineral]: ResourceSpecialityType.Common,
        [ResourceType.Particle]: ResourceSpecialityType.Special,
    },
}), new CorpFixture({
    name: 'Union Spacecraft Corporation, USC',
    alias: CorpAlias.USC,
    type: InstitutionType.Corporation,
    points: [],
    resourceValue: {
        [ResourceType.Alloy]: ResourceSpecialityType.Profile,
        [ResourceType.Crystal]: ResourceSpecialityType.Special,
        [ResourceType.Energy]: ResourceSpecialityType.Common,
        [ResourceType.Gas]: ResourceSpecialityType.Special,
        [ResourceType.Mineral]: ResourceSpecialityType.Common,
        [ResourceType.Particle]: ResourceSpecialityType.Profile,
    },
}), new CorpFixture({
    name: 'Земная федерация',
    alias: CorpAlias.EF,
    type: InstitutionType.Research,
    points: [],
    resourceValue: {
        [ResourceType.Alloy]: ResourceSpecialityType.Profile,
        [ResourceType.Crystal]: ResourceSpecialityType.Profile,
        [ResourceType.Energy]: ResourceSpecialityType.Common,
        [ResourceType.Gas]: ResourceSpecialityType.Profile,
        [ResourceType.Mineral]: ResourceSpecialityType.Common,
        [ResourceType.Particle]: ResourceSpecialityType.Profile,
    },
}),]

class CorpControllerFixture extends CorpController {
    constructor(data: Corporation) {
        super(data)
    }
}

export const Fixtures = corps

export default async function load() {
    for (let corp of corps) {
        const prev = await CorpController.find({name: corp.name})
        if (prev) {
            for (let k in corp) {
                if (k == 'alias')
                    continue
                prev[k] = corp[k]
            }
        }
        const s = prev || new CorpControllerFixture(corp)
        await s.save()
    }
}

if (module.parent==undefined)
    load()