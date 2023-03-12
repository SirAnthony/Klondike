
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
    'resource_0': 'Минералы',
    'resource_1': 'Энергия',
    'resource_2': 'Сплавы',
    'resource_3': 'Кристаллы',
    'resource_4': 'Газ',
    'resource_5': 'Частицы',
    'res_desc_id': 'SSC-ID',
    'res_desc_type': 'Тип ресурса',
    'res_desc_name': 'Название',
    'res_desc_volume': 'Объем',
    'res_desc_price': 'Цена',
    'res_desc_actions': 'Действия',
    'item_desc_type': 'Тип',
    'item_type_0': 'Ресурс',
    'item_type_1': 'Координаты',
    'item_type_2': 'Корабль',
    'item_type_3': 'Модуль',
    'item_type_4': 'Патент',
    'item_type_5': 'Артефакт',
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