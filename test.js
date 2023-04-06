const fs = require('fs')

const data = fs.readFileSync('./public/sound.mp3', 'binary')
const buf = Buffer.from(data, 'binary')
console.log(buf.toString('base64'))