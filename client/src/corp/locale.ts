import {load, default as BL} from '../common/locale'

load('corp', {
    'not_found': 'Корпорация не найдена',
    'interface': 'Интерфейс корпорации',
    'listing': 'Список корпораций',
    'desc_name': 'Название',

})

export default function L(str: string, ...args): string {
    return BL(`corp_${str}`, ...args)
}