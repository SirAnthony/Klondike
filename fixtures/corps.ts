import {Corporation} from '../client/src/common/entity'
import {CorporationController} from '../src/entity/index'

export enum CorpAlias {AP = 'AP', R = 'R', WY = 'WY', USC = 'USC', EF = 'EF'}
export class CorpFixture extends Corporation {
    alias: CorpAlias
}

const corps: CorpFixture[] = [{
    name: 'Amalgam Pharmaceuticals',
    alias: CorpAlias.AP,
}, {
    name: 'Rakuza',
    alias: CorpAlias.R,
}, {
    name: 'Wayne-Yuanti',
    alias: CorpAlias.WY,
}, {
    name: 'Union Spacecraft Corporation, USC',
    alias: CorpAlias.USC,
}, {
    name: 'Земная федерация',
    alias: CorpAlias.EF,
},]

class CorpControllerFixture extends CorporationController {
    constructor(data: Corporation) {
        super(data)
    }
}

export const Fixtures = corps

export default async function load() {
    for (let corp of corps) {
        const prev = await CorporationController.find({name: corp.name})
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