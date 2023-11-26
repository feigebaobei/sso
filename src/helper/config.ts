let accessSecret = '1234567890qwertyuiop'
let refreshSecret = '1234567890qwertyuiop'
// let accessTokenExpries = 1800000 // 30min
let accessTokenDuration = 1800000 // 30min
// let refreshTokenExpries = 86400000 // 24h
let refreshTokenDuration = 86400000 // 24h
let deletedDuration = 7200000 // 2h
let cryptoSecretString = '37725295ea78b626'
let cryptoSecretBuffer = Buffer.from(cryptoSecretString, 'utf-8')
const ivString = "efcf77768be478cb";
const ivBuffer = Buffer.from(ivString, 'utf-8');
export {
    accessSecret,
    refreshSecret,
    // accessTokenExpries,
    accessTokenDuration,
    // refreshTokenExpries,
    refreshTokenDuration,
    cryptoSecretString,
    cryptoSecretBuffer,
    deletedDuration,
    ivString,
    ivBuffer,
}