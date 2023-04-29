import {load, isDefined, default as BL} from '../common/locale'
const mod = 'map'
load(mod, {
    'listing': 'Cписок планет',
    'not_found': 'Карта не найдена',
    'desc_name': 'Имя',
    'desc_info': 'Информация',
    'desc_system': 'Система',
    'desc_resources': 'Ресурсы',
    'desc_ships': 'Корабли',
    'desc_zones': 'Зоны',
    'desc_radius': 'Радиус',
    'ui_journal': 'Журнал',
    'ui_sos': 'SOS',
    'ui_flight': 'ВЫЛЕТ',
    'ui_inventory': 'Инвентарь',
    'ui_ship': 'Корабль',
    'ui_network': 'Сеть',
})

export function LR(str: string, ...args): string {
    if (isDefined(str))
        return BL(str, ...args)
    return L(str, ...args)
}

export default function L(str: string, ...args): string {
    return BL(`${mod}_${str}`, ...args)
}