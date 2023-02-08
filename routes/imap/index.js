'use strict'

const { ImapFlow } = require('imapflow')
const MailComposer = require('nodemailer/lib/mail-composer')
const path = require('path')

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    const client = new ImapFlow({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    })

    // connect to email imap server
    await client.connect()

    // list all folders
    // console.log(await client.list())

    const attachments = []
    attachments.push({
      filename: 'Google.pdf',
      path: path.join(__dirname, './../../', 'assets', 'Google.pdf')
    })

    // email message fields
    const message = {
      from: `<${process.env.EMAIL_USERNAME}>`,
      to: process.env.EMAIL_USERNAME,
      bcc: 'botura@gmail.com',
      subject: 'Hello world',
      text: 'Hello world',
      html: '<b>Hello world</b>',
      attachments
    }

    // generate the message
    const mail = new MailComposer(message).compile()
    mail.keepBcc = true
    const content = await mail.build()

    // add the message to gmail draft folder
    await client.append(process.env.EMAIL_FOLDER_NAME, content)

    // logout
    await client.logout()
    return 'ok'
  })
}
