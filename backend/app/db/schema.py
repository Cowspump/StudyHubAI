from app.db.session import db_conn


def init_db() -> None:
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT NOT NULL DEFAULT 'student',
                    group_id TEXT,
                    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
                    email_verified_at TIMESTAMPTZ,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS email_verification_tokens (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    token TEXT NOT NULL,
                    expires_at TIMESTAMPTZ NOT NULL,
                    used BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
                """
            )
            # For projects that were created with token UNIQUE, drop it to allow short one-time codes.
            cur.execute(
                """
                ALTER TABLE email_verification_tokens
                DROP CONSTRAINT IF EXISTS email_verification_tokens_token_key;
                """
            )
            cur.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_evt_user_token_active
                ON email_verification_tokens (user_id, token)
                WHERE used = false;
                """
            )
        conn.commit()
