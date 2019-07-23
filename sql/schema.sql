CREATE TABLE IF NOT EXISTS reminders (
  reminder_id SERIAL PRIMARY KEY,

  email TEXT NOT NULL CHECK (email ~* '^.+@.+\..+$'),
  message TEXT,

  send_at DATE NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
