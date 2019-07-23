// routes/new-reminder.js

const { parseBody } = require('@frameworkless/bodyparser')

exports.uri = '/new'
exports.template = 'new_reminder'
exports.method = 'POST'

exports.data = async request => {
  const formData = await parseBody(request)
  return formData
}
