import schedule from 'node-schedule'
import { usersDb } from './mongodb'
// slet clog = console.log

let start = function() {
    // clog('start')
    // 这里的时长应与accessToken的有效时长相关。
    // jobTime = tokenDuration * 4
    let job = schedule.scheduleJob('* * */2 * * *', function() {
        let now = new Date().getTime()
        usersDb.collection('black_list').deleteMany({expires: {$lt: now}})
    })
}
export default start
