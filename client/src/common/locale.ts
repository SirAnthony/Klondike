
const aliases = {
    'save_change': 'Сохранить изменения',
    'should be an email': 'Должно быть E-mail адресом',
    'should not be empty': 'Не должно быть пустым',
    'length should bigger than 6': 'Должно быть длиннее',
    'required': 'Заполните',
    'Validation Failed': 'Пожалуйста исправьте ошибки',
    'thursday': 'четверг',
    'friday': 'пятница',
    'saturday': 'суббота',
    'sunday': 'воскресенье',
    'breakfast': 'завтрак',
    'lunch': 'обед',
    'dinner': 'ужин',
    'field_error_notvalid': 'Заполнено неверно',
    'field_error_invalid': 'Неверный параметр',
    'field_error_noempty': 'Заполните',
    'field_error_notmatch': 'Поля не совпадают',
    'field_error_unknown': 'Неизвестное поле',
    'field_error_need2': 'Заполните минимум 2 поля',
    'field_error_realage': 'Введите реальный',
    'field_error_tooshort': 'Должно быть длиннее',
    'form_error_notvalid': 'Пожалуйста исправьте ошибки',
    'error_account_exists': 'Аккаунт уже существует',
    'login_error_noemail': 'При входе не был указан E-mail',
    'login_error_invalid': 'Неправильные имя пользователя или пароль',
    'reset_password_sent': 'Письмо с инструкциями отправлено',
    'error_account_retrive': 'Аккаунт создан, но авторизация не удалась, '+
        'обновите страницу и войдите',
    'error_no_funds': 'Недостаточно средств',
    'error_already_in_flight': 'Невозможно записаться на второй вылет',
    'error_forbidden_action': 'Это действие сейчас невозможно',
    'error_no_ship': 'Отсутствуте приписанный корабль',
    'error_ship_busy': 'Корабль уже вылетел',
    'institution_desc': 'Принадлежность',
    'institution_type_0': 'Физ. Лицо',
    'institution_type_1': 'Организация',
    'institution_type_2': 'Лаборатория',
    'institution_type_3': 'Корпорация',
    'institution_type_4': 'Корабль',
    'item_desc__id': 'SSC-ID',
    'item_desc_id': 'SSC-ID',
    'item_desc_type': 'Тип',
    'item_desc_name': 'Название',
    'item_desc_owner': 'Владелец',
    'item_desc_owners': 'Владелец',
    'item_desc_price': 'Цена',
    'item_desc_actions': 'Действия',
    'item_desc_location': 'Расположение',
    'item_desc_data': 'Данные',
    'item_desc_target': 'Назначение',
    'item_desc_mass': 'Масса',
    'item_desc_energy': 'Энергия',
    'item_type_0': 'Месторождение',
    'item_type_1': 'Координаты',
    'item_type_2': 'Модуль',
    'item_type_3': 'Патент',
    'item_type_4': 'Артефакт',
    'res_desc_kind': 'Тип ресурса',
    'res_desc_value': 'Количество',
    'res_desc_provided': 'Предоставлено',
    'res_kind_0': 'Минералы',
    'res_kind_1': 'Энергия',
    'res_kind_2': 'Сплавы',
    'res_kind_3': 'Кристаллы',
    'res_kind_4': 'Газ',
    'res_kind_5': 'Частицы',
    'res_spec_value_0': 'Обычный',
    'res_spec_value_1': 'Специальный',
    'res_spec_value_2': 'Профильный',
    'patent_desc_kind': 'Вид патента',
    'patent_desc_weight': 'Тип патента',
    'patent_desc_ownership': 'Владение',
    'patent_kind_0': 'Био-медицинский',
    'patent_kind_1': 'Инженерный',
    'patent_kind_2': 'Планетарный',
    'patent_weigth_0': 'Незначительный',
    'patent_weigth_1': 'Базовый',
    'patent_weigth_2': 'Премиум',
    'patent_ownership_full': 'Полное',
    'patent_ownership_shared': 'Долевое',
    'patent_status_0': 'C',
    'patent_status_1': 'R',
    'patent_status_2': 'S',
    'artifact_desc_kind': 'Тип артефакта',
    'artifact_kind_0': 'Био-медицинский',
    'artifact_kind_1': 'Инженерный',
    'artifact_kind_2': 'Аномалия',
    'ship_desc_kind': 'Класс корабля',
    'user_desc_kind': 'Роль',
    'user_kind_0': 'Нет',
    'user_kind_1': 'Корпорант',
    'user_kind_2': 'Капитан',
    'user_kind_4': 'Механик',
    'user_kind_8': 'Навигатор',
    'user_kind_16': 'Ученый',
    'user_kind_32': 'СБ',
    'user_kind_64': 'Мастер',
    'loc_desc_coord': 'Координаты (x:y)',
    'flight_desc_type': 'Тип вылета',
    'flight_type_0': 'Планетарный вылет',
    'flight_type_1': 'Запуск дрона',
    'flight_desc_status': 'Статус',
    'flight_status_0': 'В доке',
    'flight_status_1': 'Ожидание',
    'flight_status_2': 'Вылетел',
    'flight_status_3': 'SOS',
    'flight_status_4': 'Заблокирован',
    'planet_desc_kind': 'Тип планеты',
    'entity_desc_credit': 'Счет',
    'entity_desc_cost': 'Стоимость',
    'desc_time': 'Время',
    'cycle': 'Цикл',
    'day_number': 'день',
    'assignee': 'Исполнитель',
    'inventory': 'Инвентарь',
    'error_empty_select': 'Не выбрано',
    'error_value_high': 'Значение слишком велико',
    'error_value_low': 'Значение слишком мало',
    'act_add': 'Добавить',
    'act_remove': 'Удалить',
    'act_edit': 'Редактировать',
    'act_save': 'Сохранить',
    'act_cancel': 'Отмена',
    'act_show_data': 'Показать данные',
}

export function extend(obj: {string: string | ((...values: any[])=>string)}) {
    for (let k in obj)
        aliases[k] = obj[k];
}

export function tpl(strings, ...keys) {
    return (function(...values) {
      let dict = values[values.length - 1] || {};
      let result = [strings[0]];
      keys.forEach(function(key, i) {
        let value = Number.isInteger(key) ? values[key] : dict[key];
        result.push(value, strings[i + 1]);
      });
      return result.join('');
    });
}

export function isDefined(key) { return key in aliases }
export function load(type, values) {
    for (let key in values)
        aliases[`${type}_${key}`] = values[key]
}

export default function L(str: string, ...args): string {
    const ret = aliases[str]||str
    return typeof ret==='function' ? ret(...args) : ret
}