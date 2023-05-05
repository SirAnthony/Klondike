import {load, isDefined, tpl, default as BL} from '../common/locale'
const mod = 'ship'
load(mod, {
    'not_found': 'Корабль не найден',
    'interface': 'Интерфейс корабля',
    'listing': 'Список кораблей',
    'flights_listing': 'Таблица вылетов',
    'install_module': 'Установить модуль',
    'repair': 'Починить корабль',
    'desc_control_drone': 'Управление дроном',
    'stats_title': 'Характеристики',
    'stats_values': 'Текущее значение',
    'stat_integrity': 'Состояние',
    'stat_integrity_c': 'Hp',
    'stat_mass': 'Масса',
    'stat_mass_c': 'M',
    'stat_engine': 'Мощность двигателя',
    'stat_engine_c': 'P',
    'stat_slots': 'Количество слотов',
    'stat_slots_c': 'T',
    'stat_speed': 'Скорость',
    'stat_speed_c': 'V',
    'stat_movement': 'Маневренность',
    'stat_movement_c': 'U',
    'stat_size': 'Размер',
    'stat_size_c': 'S',
    'stat_attack': 'Атака',
    'stat_attack_c': 'A',
    'stat_defence': 'Защита',
    'stat_defence_c': 'D',
    'stat_crew': 'Размер экипажа',
    'stat_crew_c': 'CR',
    'stat_research': 'Скорость исследования',
    'stat_research_c': 'RS',
    'stat_researchzone': 'Радиус исследования',
    'stat_researchzone_c': 'RZ',
    // Cross with engine power
    'stat_energy': 'Энергопотребление',
    'stat_energy_c': 'p',
    'description': 'Общая информация',
    'desc_ship': 'Корабль',
    'desc_name': 'Название',
    'desc__id': 'SSC ID',
    'desc_port': 'Порт приписки',
    'desc_captain': 'Капитан',
    'desc_owner': 'Владелец корабля',
    'desc_balance': 'Баланс',
    'desc_info_hidden': '[Информация скрыта]',
    'desc_arrived': 'Прибыл',
    'mod_title': 'Дополнительные модули',
    'mod_values': 'Текущее значение',
    'mod_slot': 'Слот',
    'mod_empty': 'ПУСТО',
    'mod_stat': name=>L('stat_'+name)+' модуля',
    'mod_stat_c': name=>'MOD'+L(`stat_${name}_c`),
    'act_flight_signup': 'Заявиться на вылет',
    'act_flight_delist': 'Отменить заявку',
    'act_flight_block': 'Заблокировать',
    'act_flight_unblock': 'Разблокировать',
    'act_flight_help': 'Выслать помощь',
    'act_flight_arrival': 'Прилет',
    'act_flight_departure': 'Вылет',
    'act_flight_retrive': 'Вернуть',
})

export function LR(str: string, ...args): string {
    if (isDefined(str))
        return BL(str, ...args)
    return L(str, ...args)
}

export default function L(str: string, ...args): string {
    return BL(`${mod}_${str}`, ...args)
}