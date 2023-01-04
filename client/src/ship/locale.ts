import {load, default as BL} from '../common/locale'

load('ship', {
    'not_found': 'Корабль не найден',
    'install_module': 'Установить модуль',
    'repair': 'Починить корабль',
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
    'stat_attack': 'Атака',
    'stat_attack_c': 'A',
    'stat_defence': 'Защита',
    'stat_defence_c': 'D',
    'stat_crew': 'Размер экипажа',
    'stat_crew_c': 'CR',
    // Cross with engine power
    'stat_energy': 'Энергопотребление',
    'stat_energy_c': 'p',
    'description': 'Общая информация',
    'desc_name': 'Название',
    'desc__id': 'SSC ID',
    'desc_class': 'Класс корабля',
    'desc_port': 'Порт приписки',
    'desc_captain': 'Капитан',
    'desc_owner': 'Владелец корабля',
    'mod_title': 'Дополнительные модули',
    'mod_values': 'Текущее значение',
    'mod_slot': 'Слот',
    'mod_empty': 'ПУСТО',
    'mod_stat': name=>L('stat_'+name)+' модуля',
    'mod_stat_c': name=>'MOD'+L(`stat_${name}_c`)
})

export default function L(str: string, ...args): string {
    return BL(`ship_${str}`, ...args)
}