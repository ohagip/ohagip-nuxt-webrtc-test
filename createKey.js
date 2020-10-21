const pem = require('pem')
const fs = require('fs')

pem.createCertificate({}, (err, keys) => {
  fs.writeFileSync('server.key', keys.serviceKey)
  fs.writeFileSync('server.crt', keys.certificate)
})
