-- Apply once to the application database before using the updated sign-in route.
CREATE TABLE IF NOT EXISTS login_attempt_limits (
  account_key text PRIMARY KEY,
  attempts integer NOT NULL CHECK (attempts >= 0),
  window_started_at timestamptz NOT NULL DEFAULT now()
);
