// let { MongoClient } = require('mongodb')
import {MongoClient} from 'mongodb'
// let clog = console.log

let uri = 'mongodb+srv://feigebaobei:1qaz2wsx@feigebaobei.ojo8z3u.mongodb.net/?retryWrites=true&w=majority'
let client = new MongoClient(uri)
let usersDb = client.db('users')

// module.exports = {
export {
    usersDb,
}