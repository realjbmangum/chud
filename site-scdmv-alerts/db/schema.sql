-- SC DMV Alerts D1 Schema

-- Subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'paid')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'paused')),
  appointment_type TEXT NOT NULL,
  preferred_region TEXT DEFAULT 'any',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  alerts_sent_today INTEGER DEFAULT 0,
  last_alert_date TEXT,
  unsubscribe_token TEXT DEFAULT (lower(hex(randomblob(16)))),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_type_region ON subscribers(appointment_type, preferred_region);
CREATE INDEX IF NOT EXISTS idx_subscribers_unsubscribe ON subscribers(unsubscribe_token);

-- Availability checks (for tracking what we've seen)
CREATE TABLE IF NOT EXISTS availability_checks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  checked_at TEXT DEFAULT (datetime('now')),
  appointment_type TEXT,
  region TEXT,
  slots_found INTEGER DEFAULT 0,
  slots_data TEXT, -- JSON of available slots
  is_new INTEGER DEFAULT 0 -- 1 if this had new slots since last check
);

CREATE INDEX IF NOT EXISTS idx_checks_time ON availability_checks(checked_at);

-- Notifications sent
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  subscriber_id TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  appointment_data TEXT, -- JSON of the appointment details
  sent_at TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT,
  FOREIGN KEY (subscriber_id) REFERENCES subscribers(id)
);

CREATE INDEX IF NOT EXISTS idx_notifications_subscriber ON notifications(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sent ON notifications(sent_at);

-- Daily alert counter reset trigger (run via cron)
-- Note: D1 doesn't support triggers, so we'll reset via scheduled worker
