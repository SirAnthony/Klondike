import {load, isDefined, default as BL} from '../common/locale'

load('map', {
    'listing': 'Cписок планет',
    'not_found': 'Карта не найдена',
    'desc_name': 'Имя',
    'desc_info': 'Информация',
    'desc_resources': 'Ресурсы',
    'desc_ships': 'Корабли',
    'desc_zones': 'Зоны',
    'ui_journal': 'Журнал',
    'ui_sos': 'SOS',
    'ui_flight': 'ВЫЛЕТ',
    'ui_inventory': 'Инвентарь',
    'ui_ship': 'Корабль',
    'ui_network': 'Сеть',
})

export function LR(str: string, ...args): string {
    if (isDefined(`map_${str}`))
        return L(str, ...args)
    return str
}

export default function L(str: string, ...args): string {
    return BL(`map_${str}`, ...args)
}