
import * as passport from 'koa-passport';
import {BaseRouter, CheckParam, CheckAuthenticated} from './base'
import {RenderContext} from '../middlewares'
import {UserController, AuthToken} from '../entity'
import {Oauth} from '../auth';
import * as phonenumber from 'libphonenumber-js'
import * as util from '../util/util'
import * as crypto from 'crypto'
import * as Mail from '../mail'
import * as CError from '../../client/src/common/errors';

export class AuthRouter extends BaseRouter {
    get fail_redir(){ return this.r.url('login', {}) }

    get_info(ctx: RenderContext){
        return ctx.state.user
    }

    get_login(ctx: RenderContext){
        if (ctx.state.user)
            return ctx.returnTo('/')
        return {title: 'Login'}
    }

    @CheckParam({email: 'email', password: 'password'})
    post_login(ctx: RenderContext, next){
        return new Promise((resolve, reject)=>{
            passport.authenticate('local', (err, user, info)=>{
                if (!err && user){
                    ctx.login(user)
                    return resolve({user})
                }
                return reject(new CError.ApiError(
                    CError.Codes.INCORRECT_LOGIN, err.message,
                    [{message: err.message}]))
            })(ctx, next)
        })
    }

    get_logout(ctx: RenderContext){
        //if (!ctx.isAuthenticated())
        //    ctx.throw(401, 'Not authorized')
        ctx.logout()
        return ctx.returnTo()
    }

    get_signup(ctx: RenderContext){
        if (ctx.state.user)
            return ctx.returnTo()
        return {title: 'Create Account'}
    }

    @CheckParam({email: 'email', password: 'password', phone: 'string'})
    async post_signup(ctx: RenderContext){
        const params: any = ctx.request.body;
        params.email = util.clear_email(params.email)
        this.check_param(ctx, params.password==params.confirm, 'confirm',
            'field_error_notmatch')
        this.check_param(ctx, params.password.length>=6, 'password',
            'field_error_tooshort')
        this.check_param(ctx, [params.alias, params.first_name,
            params.second_name, params.last_name].filter(Boolean).length>1,
            'alias', 'field_error_need2')
        this.check_param(ctx, phonenumber.isValidPhoneNumber(params.phone, 'RU'),
            'phone', 'field_error_notvalid')
        this.check_param(ctx, (params.age|0)>=18, 'age', 'field_error_realage')
        let user = await UserController.find({email: params.email})
        if (user)
            return ctx.throw(401, 'error_account_exists')
        user = await UserController.fromObj(params)
        const ret = await user.save()
        if (!ret.upsertedId)
            return ctx.throw(401, 'error_account_retrive')
        user._id = ret.upsertedId
        await ctx.login(user)
        return ctx.returnTo()
    } 

    @CheckParam({token: 'string'})
    async get_reset(ctx: RenderContext){
        if (ctx.isAuthenticated())
            return ctx.returnTo()
        const {token} = ctx.params
        const user = await UserController.find({reset_token: token,
            reset_expires: {$gt: Date.now()}})
        if (!user){
            ctx.flash('errors', {msg: 'Password reset token is invalid or expired'})
            return ctx.redirect('/forgot')
        }
        return {title: 'Password Reset'}
    }

    @CheckParam({password: 'password', confirm: 'password'})
    async post_reset(ctx: RenderContext){
        const params: any = ctx.request.body;
        this.check_param(ctx, params.password!=params.confirm, 'confirm',
            'Password does not match')
        const user = await UserController.find({reset_token: params.token,
            reset_expires: {$gt: Date.now()}}, ['reset_token', 'reset_expires'])
        this.check_param(ctx, user.reset_token && user.reset_expires &&
            (+(new Date()) - +(new Date(user.reset_expires)) < 0), 'token',
            'Password reset token is invalid or has expired')
        user.password = await UserController.hash_password(params.password)
        user.reset_token = undefined
        user.reset_expires = undefined
        await user.save()
        await Mail.send({to: user.email, subject: "Your password has been changed",
            text: 'Hello,\n\nThis is a confirmation that the password for '+
            `your account ${user.email} has just been changed.\n`})
        return { msg: "Success! Your password has been changed." }
    }

    get_forgot(ctx: RenderContext){
        if (ctx.isAuthenticated())
            return ctx.returnTo()
        return {title: 'Forgot Password'}
    }

    @CheckParam({email: 'email'})
    async post_forgot(ctx: RenderContext){
        const email = util.clear_email(ctx.request.body.email)
        this.check_param(ctx, email, 'email', 'Misssing email to reset')
        const token = (await crypto.randomBytes(16)).toString('hex')
        const user = await UserController.find({email})
        this.check_param(ctx, user, 'email', 'Accound does not exists')
        user.reset_token = token;
        user.reset_expires = new Date(Date.now() + 3600000); // 1 hour
        await user.save()
        await Mail.send({to: user.email, subject: 'Reset your password',
            text: 'You are receiving this email because you (or someone else) '+
            'have requested the reset of the password for your account.\n\n'+
            'Please click on the following link, or paste this into your '+
            'browser to complete the process:\n\n'+
            `http://${ctx.headers.host}/reset/${token}\n\n`+
            'If you did not request this, please ignore this email and your '+
            'password will remain unchanged.\n'})
    }

    @CheckAuthenticated()
    @CheckParam({provider: 'string'})
    async get_oauth_unlink(ctx: RenderContext){
        const {provider} = ctx.params
        const {user}: {user: UserController} = ctx.state
        const method = Oauth.shortcuts[provider]||provider
        user[method] = undefined
        if (user.tokens)
            delete user.tokens[method]
        await user.save()
    }

    async get_oauth(ctx: RenderContext, next: any){
        const {name} = ctx.params
        const method = Oauth.shortcuts[name]||name
        return await passport.authenticate(method,
            Oauth.scopes[name])(ctx, next);
    }
    async get_oauth_callback(ctx: RenderContext, next: any){
        const {name} = ctx.params
        const method = Oauth.shortcuts[name]||name
        return await passport.authenticate(method, {
            failureRedirect: this.fail_redir})(ctx, next)
    }
}
