import {load, default as BL} from '../common/locale'

load('map', {
    'listing': 'Cписок планет',
    'not_found': 'Карта не найдена',
    'desc_name': 'Имя',
    'desc_info': 'Информация',
    'desc_resources': 'Ресурсы',
    'desc_ships': 'Корабли',
    'desc_zones': 'Зоны',
})

export default function L(str: string, ...args): string {
    return BL(`map_${str}`, ...args)
}