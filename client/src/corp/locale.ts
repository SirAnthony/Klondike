import {load, isDefined, tpl, default as BL} from '../common/locale'
const mod = 'corp'
load(mod, {
    'not_found': 'Корпорация не найдена',
    'interface': 'Интерфейс корпорации',
    'listing': 'Список корпораций',
    'desc_name': 'Название',
    'balance': 'Текущий счет',
    'currency': 'Кредиты',
    'order': tpl`Текущий заказ на цикл ${0}`,
    'plan': tpl`Выполнение плана: ${0}%`,
    'market_prices': 'Рыночные цены',
})

export function LR(str: string, ...args): string {
    if (isDefined(`${mod}_${str}`))
        return L(str, ...args)
    return str
}

export default function L(str: string, ...args): string {
    return BL(`${mod}_${str}`, ...args)
}