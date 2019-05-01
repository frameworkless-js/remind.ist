const { parse: parseFormadata } = require('querystring')

const getRequestBody = request => new Promise((resolve, reject) => {
  let formData = ''

  request.on('data', buffer => formData += buffer.toString())
  request.on('error', reject)

  request.on('end', () => {
    const parsedData = parseFormadata(formData)
    return resolve(parsedData)
  })
})

module.exports = getRequestBody
