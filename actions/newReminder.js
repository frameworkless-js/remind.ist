// actions/newReminder.js

module.exports = async (db, { email, message, send_at }) => {
  const { rows: [ reminder ] } = await db.query(
    'INSERT INTO reminders (email, message, send_at) VALUES ($1, $2, $3) RETURNING *',
    [ email, message, send_at ]
  )

  return reminder
}
