import {load, isDefined, tpl, default as BL} from '../common/locale'
const mod = 'corp'
load(mod, {
    'not_found': 'Сущность не найдена',
    'interface': tpl`Интерфейс корпорации ${0}`,
    'listing': 'Список корпораций',
    'desc_name': 'Название',
    'balance': 'Текущий счет',
    'currency': 'Кредиты',
    'corporations_rating': 'Рейтинг корпораций',
    'suitable_loans': 'Подходящие займы',
})

export function LR(str: string, ...args): string {
    if (isDefined(str))
        return BL(str, ...args)
    return L(str, ...args)
}

export default function L(str: string, ...args): string {
    return BL(`${mod}_${str}`, ...args)
}