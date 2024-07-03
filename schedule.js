// import schedule from 'node-schedule'
// import { usersDb } from './mongodb'
const schedular = require('node-schedule')
let {usersDb} = require('./mongodb')
// let clog = console.log

let start = function() {
    // clog('start')
    // 这里的时长应与accessToken的有效时长相关。
    // jobTime = tokenDuration * 4
    // *    *    *    *    *    *
    // ┬    ┬    ┬    ┬    ┬    ┬
    // │    │    │    │    │    │
    // │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
    // │    │    │    │    └───── month (1 - 12)
    // │    │    │    └────────── day of month (1 - 31)
    // │    │    └─────────────── hour (0 - 23)
    // │    └──────────────────── minute (0 - 59)
    // └───────────────────────── second (0 - 59, OPTIONAL)

    // let job = schedule.scheduleJob('* * */2 * * *', function() {
    //     let now = new Date().getTime()
    //     usersDb.collection('black_list').deleteMany({expires: {$lt: now}})
    // })
    
    let cleanVerificationCode = schedule.scheduleJob('* * * * */2 *', () => {
        let now = new Date().getTime()
        usersDb.collection('verification_code').deleteMany({expiredTime: {$lt: now}})
    })
}
// export default start
// export {
//     start,
// }
module.exports = {start};