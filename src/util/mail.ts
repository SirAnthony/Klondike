
//import * as nodemailer from 'nodemailer'
const {env} = process

let transport;
function get_transport(){
    if (transport)
        return transport;
    //return transport = nodemailer.createTransport({service: 'SendGrid',
    //    auth: {user: env.SENDGRID_USER, pass: env.SENDGRID_PASSWORD}})
}


export async function send(_opt: any){
    const opt = Object.assign({from: 'nobody@domain'}, _opt)
    const tr = get_transport()
    return await tr.sendMail(opt)
}
