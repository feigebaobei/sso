let accessSecret = '1234567890qwertyuiop'
let refreshSecret = '1234567890qwertyuiop'
let accessTokenExpries = 1800000 // 30min
let refreshTokenExpries = 86400000 // 24h
let cryptoSecretString = '37725295ea78b626'
let cryptoSecretBuffer = Buffer.from(cryptoSecretString, 'utf-8')
const ivString = "efcf77768be478cb";
const ivBuffer = Buffer.from(ivString, 'utf-8');
export {
    accessSecret,
    refreshSecret,
    accessTokenExpries,
    refreshTokenExpries,
    cryptoSecretString,
    cryptoSecretBuffer,
    ivString,
    ivBuffer,
}