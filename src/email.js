const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
//   host: "smtp.ethereal.email",
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false, // Use `true` for port 465, `false` for all other ports
//   auth: {
//         // user: "maddison53@ethereal.email",
//         // pass: "jn7jnAPss4f63QBp6D",
//         user: 'baobeifeige@gmail.com',
//         pass: 'Feige177105',
//     },

    // host: "smtp.gmail.com",
    // port: 465,
    // secure: true, // Use `true` for port 465, `false` for all other ports
    // auth: {
    //     // user: "maddison53@ethereal.email",
    //     // pass: "jn7jnAPss4f63QBp6D",
    //     user: 'baobeifeige@gmail.com',
    //     pass: 'Feige177105',
    // },

    host: "smtp.163.com",
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
        // user: '18515195415@163.com',
        // pass: 'feige177105',
        user: 'm13632197334@163.com',
        pass: 'IEQBKETRKYUEVVJV'
        // user: 'm13632197334@163.com', // 连接失败 Error: Invalid login: 535 Error: authentication failed
        // pass: 'feige177105',
    },
});

transporter.verify((err, success) => {
    if (err) {
        console.log('连接失败', err)
    } else {
        console.log('连接成功', success)
    }
})

// async..await is not allowed in global scope, must use a wrapper
async function main() {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    // from: 'baobeifeige@gmail.com', // sender address
    // from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>', // sender address
    // to: "bar@example.com, baz@example.com", // list of receivers
    // to: '18515195415@163.com',
    from: '18515195415@163.com',
    // to: 'baobeifeige@gmail.com',
    to: '1171981878@qq.com',
    subject: "Hello ✔", // Subject line
    text: "我发送邮件成功了。", // plain text body
    // html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

main().catch(console.error);
