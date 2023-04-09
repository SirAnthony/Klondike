import {load, isDefined, tpl, default as BL} from '../common/locale'
const mod = 'inventory'
load(mod, {
    'not_found': 'Сущность не найдена',
    'interface': tpl`Интерфейс ${0}`,
    'desc_name': 'Название',
    'balance': 'Текущий счет',
    'currency': 'Кредиты',
    'market_prices': 'Рыночные цены',
    'res_cur': 'Собственность',
})

export function LR(str: string, ...args): string {
    if (isDefined(str))
        return BL(str, ...args)
    return L(str, ...args)
}

export default function L(str: string, ...args): string {
    return BL(`${mod}_${str}`, ...args)
}