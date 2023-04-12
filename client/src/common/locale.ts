
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
    'institution_desc': 'Принадлежность',
    'institution_type_0': 'Физ. Лицо',
    'institution_type_1': 'Организация',
    'institution_type_2': 'Лаборатория',
    'institution_type_3': 'Корпорация',
    'institution_type_4': 'Корабль',
    'item_desc_id': 'SSC-ID',
    'item_desc_type': 'Тип',
    'item_desc_name': 'Название',
    'item_desc_owner': 'Владелец',
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
    'res_kind_0': 'Минералы',
    'res_kind_1': 'Энергия',
    'res_kind_2': 'Сплавы',
    'res_kind_3': 'Кристаллы',
    'res_kind_4': 'Газ',
    'res_kind_5': 'Частицы',
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
    'loc_desc_coord': 'Координаты (x:y)',
    'cycle': 'Цикл',
    'day_number': 'день',
    'assignee': 'Исполнитель',
    'error_empty_select': 'Не выбрано',
    'error_value_high': 'Значение слишком велико',
    'error_value_low': 'Значение слишком мало',
    'act_add': 'Добавить',
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