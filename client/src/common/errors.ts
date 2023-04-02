
export enum Codes {
    INITIAL_VALUE,
    INCORRECT_LOGIN = 4000,
    NO_LOGIN,
    NOT_ADMIN,
    WRONG_USER,
    INCORRECT_PARAM,
    INCORRECT_REGISTRATION,
    INCORRECT_SELECTION,
    INCORRECT_BOOK_PASSWORD,
    CLIENT_ERROR,
}

export const Statuses = {
    [Codes.INCORRECT_LOGIN]: 401,
    [Codes.NO_LOGIN]: 401,
    [Codes.NOT_ADMIN]: 403,
    [Codes.WRONG_USER]: 403,
    [Codes.INCORRECT_REGISTRATION]: 401,
    [Codes.INCORRECT_PARAM]: 422,
}

export const Status = (code: Codes)=>Statuses[code]

export type ApiStackError = {
    message: string
    code: number
}

export class ApiError {
    code: Codes
    status: number
    message: string
    stack: ApiStackError[]
    constructor(code = Codes.INITIAL_VALUE, message = 'Api Error', stack?: any[], status?){
        this.code = code
        this.status = status||Status(code)||500
        this.message = message
        this.stack = [].concat(stack).filter(Boolean)
    }
    get valid(){ return this.code != Codes.INITIAL_VALUE }
    static from(obj: any) : ApiError {
        if (obj instanceof ApiError)
            return obj
        return new ApiError(obj.code, obj.message,
            obj.errors||obj.stack, obj.status)
    }
}

export class ClientError extends ApiError {
    constructor(message: string){
        super(Codes.CLIENT_ERROR, message)
    }

}

export type FormValidationError = ApiStackError & {
    field: string
}

