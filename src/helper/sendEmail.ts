import type { S } from '../types'

const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    host: 'smtp.163.com',
    port: 465,
    secure: true,
    auth: {
        user: 'm13632197334@163.com',
        pass: 'IEQBKETRKYUEVVJV',
    }
})
interface SendParams {
    to: S
    subject: S
    text?: S
    html?: S
}
let send = (p: SendParams) => {
    return transporter.sendMail({
        // from: 'HeShiJade',
        from: '18515195415@163.com',
        to: p.to,
        subject: p.subject,
        text: p.text,
        html: p.html,
    })
}

export {
    send,
}