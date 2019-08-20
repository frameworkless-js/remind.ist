const { readFileSync } = require('fs')
const MailgunClient = require('mailgun-js')
const Handlebars = require('handlebars')
const glob = require('glob')

const hbsHelpers = require('../lib/handlebar-helpers')

const { MAILGUN_API_KEY, MAILGUN_DOMAIN, APP_NAME, MAILGUN_SEND_EMAIL_FROM } = process.env
if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) throw new Error(
  'MAILGUN_API_KEY & MAILGUN_DOMAIN are required env variables.'
)

const client = MailgunClient({
  apiKey: MAILGUN_API_KEY,
  domain: MAILGUN_DOMAIN,
  username: 'api'
})

Object.keys(hbsHelpers).map(helper => {
  Handlebars.registerHelper(helper, hbsHelpers[helper])
})

const mails = {}

for (const mail of glob.sync('./emails/**.hbs')) {
  const pathTokens = mail.split('/')
  const key = pathTokens[pathTokens.length - 1].slice(0, -4)
  const [ subject, body ] = readFileSync(mail, { encoding: 'utf8' }).split('---')
  mails[key] = { subject, body }
}

const compile = (emailName, context) => {
  const mail = mails[emailName]
  if (!mail) throw new Error(`Email ${emailName} not found.`)

  const body = Handlebars.compile(mail.body)
  const subjectTemplate = Handlebars.compile(mail.subject)
  const from = MAILGUN_SEND_EMAIL_FROM || `Remind.ist <bot@${MAILGUN_DOMAIN}>`

  const compileContext = {
    app_name: APP_NAME,
    ...context
  }

  const subject = subjectTemplate(compileContext)

  const message = {
    from,
    to: context.email,
    subject,
    html: body({ ...compileContext, subject }),
    'o:tag': [ emailName ],
    'o:tracking': 'True'
  }

  return message
}

const send = async email => {
  try {
    const send = await client.messages().send(email)
    console.log(`=> Email queued: ${send.id}`)
  } catch (error) {
    console.error(`=> Error sending email: ${error.message}`)
    if (error.stack) console.log(error.stack)
  }
}

module.exports = { compile, send }
