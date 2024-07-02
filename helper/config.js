let accessSecret = '1234567890qwertyuiop'
let refreshSecret = '1234567890qwertyuiop'
// let accessTokenExpries = 1800000 // 30min
let accessTokenDuration = 1800000 // 30min
// let refreshTokenExpries = 86400000 // 24h
let refreshTokenDuration = 86400000 // 24h
let deletedDuration = 7200000 // 2h
let verificationExpiredTime = 120000 // 2min
let cryptoSecretString = '37725295ea78b626'
let cryptoSecretBuffer = Buffer.from(cryptoSecretString, 'utf-8')
const ivString = "efcf77768be478cb";
const ivBuffer = Buffer.from(ivString, 'utf-8');
let numberArr = [0,1,2,3,4,5,6,7,8,9]
module.export = {
    accessSecret,
    refreshSecret,
    // accessTokenExpries,
    accessTokenDuration,
    // refreshTokenExpries,
    refreshTokenDuration,
    cryptoSecretString,
    cryptoSecretBuffer,
    deletedDuration,
    verificationExpiredTime,
    ivString,
    ivBuffer,
    numberArr,
}