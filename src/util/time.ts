import * as date from '../../client/src/common/date'

export const Time = new date.Time({
    serverTime: 0,
    basicTime: 0,
    cycleLength: 4*date.ms.HOUR,
})