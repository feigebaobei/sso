const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
    host: 'smtp.163.com',
    port: 465,
    secure: true,
    auth: {
        user: 'm13632197334@163.com',
        pass: 'IEQBKETRKYUEVVJV',
    }
})


let send = (p) => {
    return transporter.sendMail({
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