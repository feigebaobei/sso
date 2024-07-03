const { MongoClient } = require('mongodb')
// import {MongoClient} from 'mongodb'
// import {MongoClientOptions} from 'mongodb'
// let clog = console.log

let uri = 'mongodb+srv://feigebaobei:1qaz2wsx@feigebaobei.ojo8z3u.mongodb.net/?retryWrites=true&w=majority'
// let uri = 'mongodb+srv://feigebaobei:1qaz2wsx@feigebaobei.ojo8z3u.mongodb.net/?retryWrites=true&w=majority&directConnection=true'
// const uri = "mongodb+srv://<username>:<password>@<your-cluster-url>/sample_airbnb?retryWrites=true&w=majority";
let client = new MongoClient(uri)
// let client = new MongoClient(uri, { useUnifiedTopology: true } as MongoClientOptions)
// let client = new MongoClient(uri, { 
//     // useUnifiedTopology: true,
//     //  useNewUrlParser: true,
//     //   connectTimeoutMS: 30000,
//     //   keepAlive: 1
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     });
//           // new MongoClient(uri, { useUnifiedTopology: true}, { useNewUrlParser: true }, { connectTimeoutMS: 30000 }, { keepAlive: 1});
// let usersDb = client.db('users', {useUnifiedTopology: true})
let usersDb = client.db('users')

// module.exports = {
// export {
//     usersDb,
// }
module.exports = {usersDb};