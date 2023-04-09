import {Corporation, InstitutionType} from '../client/src/common/entity'
import {CorpController} from '../src/entity'

export enum CorpAlias {AP = 'AP', R = 'R', WY = 'WY', USC = 'USC', EF = 'EF'}
export class CorpFixture extends Corporation {
    alias: CorpAlias
    constructor(data){
        super()
        for (let key in data)
            this[key] = data[key]
        this.points = []
        this.credit = 25000
    }
}

const corps: CorpFixture[] = [new CorpFixture({
    name: 'Amalgam Pharmaceuticals',
    alias: CorpAlias.AP,
    type: InstitutionType.Corporation,
    points: [],
}), new CorpFixture({
    name: 'Rakuza',
    alias: CorpAlias.R,
    type: InstitutionType.Corporation,
    points: [],
}), new CorpFixture({
    name: 'Wayne-Yuanti',
    alias: CorpAlias.WY,
    type: InstitutionType.Corporation,
    points: [],
}), new CorpFixture({
    name: 'Union Spacecraft Corporation, USC',
    alias: CorpAlias.USC,
    type: InstitutionType.Corporation,
    points: [],
}), new CorpFixture({
    name: 'Земная федерация',
    alias: CorpAlias.EF,
    type: InstitutionType.Research,
    points: [],
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