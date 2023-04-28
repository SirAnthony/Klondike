import * as passport from 'koa-passport'
import {Strategy as LocalStrategy} from 'passport-local'
import {Strategy as VKStrategy} from 'passport-vkontakte'
// import {Strategy as GoogleStrategy} from 'passport-google-oauth20'
// import {Strategy as FacebookStrategy} from 'passport-facebook'
import {Controller as UserController, VKProfile, AuthToken} from './entity/users';
import {ApiError, Codes} from '../client/src/common/errors'
import * as secrets from '../secrets.tokens.json'
import * as util from './util/util'

export const Oauth = {
shortcuts: {
    vk: 'vkontakte',
},
scopes: {
    google: ['profile'],
    vk: ['email', 'phone'],
}}

class Account {
    register() {
        passport.serializeUser(this.serialize)
        passport.deserializeUser(this.deserialize)
        passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        }, this.localStrategy))
        /* passport.use(new GoogleStrategy({
             clientID: secrets.google.appid,
             clientSecret: secrets.google.secret,
             callbackURL: '/auth/oauth/google/callback'
        }, this.googleStrategy)) */
        passport.use(new VKStrategy({
            clientID: secrets.vk.appid,
            clientSecret: secrets.vk.secret,
            callbackURL: '/auth/oauth/vk/callback',
            scope: Oauth.scopes.vk,
            profileFields: ['email'],
        }, this.vkStrategy))
    }

    serialize(req, user: UserController, done) {
        done(null, user._id)
    }
    async deserialize(id: string, done) {
        try { done(null, await UserController.get(id)) }
        catch(e){
            console.error(`Deserealize error: ${e}`)
            done(null, null)
        }
    }

    async localStrategy(email: string, password: string, done) {
        email = util.clear_email(email)
        const user = await UserController.find({email})
        if (!user || !(await UserController.check_password(user, password)))
            return done(new Error('login_error_invalid'))
        delete user.password
        done(null, user)
    }

 /**
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */
    async googleStrategy(accessToken, refreshToken, profile) {
        throw 'Not implemented'
        /*const conn = await getConnection()
        const user = conn.getRepository(User).findOne(

          User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
          });
        */
    }

    async vkStrategy(accessToken, refreshToken, profile: VKProfile, done) {
        if (!profile || !profile.emails?.length)
            return done(new ApiError(Codes.INCORRECT_LOGIN, 'login_error_noemail'))
        let user: UserController
        for (let item of profile.emails){
            const email = util.clear_email(item.value)
            if (user = await UserController.find({email}))
                break;
        }
        // associate user with local one or create new
        user = user || UserController.fromVK(profile)
        user.vkontakte = profile.id
        if (Array.isArray(user.tokens))
            delete user.tokens
        user.tokens = user.tokens || ({} as {string: AuthToken})
        user.tokens['vkontakte'] = {token: accessToken, ts: new Date()}
        const ret = await user.save()
        if (!user._id && ret.upsertedId)
            user._id = ret.upsertedId
        if (!user._id)
            return done(new ApiError(Codes.INCORRECT_LOGIN, 'error_account_retrive'))
        done(null, user)
    }
}

export let account = new Account()