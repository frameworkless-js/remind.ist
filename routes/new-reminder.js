// routes/new-reminder.js

const { parseBody } = require('@frameworkless/bodyparser')

const { newReminder } = require('../actions')

exports.uri = '/new'
exports.template = 'new_reminder'
exports.method = 'POST'

exports.data = async ({ request, db }) => {
  const formData = await parseBody(request)
  const reminder = await newReminder(db, formData)

  return reminder
}
