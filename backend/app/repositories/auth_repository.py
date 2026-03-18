from app.db.session import db_conn


def find_user_by_email(email: str):
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, name, email, role, group_id, password_hash, is_verified FROM users WHERE email = %s", (email,))
            return cur.fetchone()


def create_user(name: str, email: str, password_hash: str, role: str, group_id: str | None):
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO users (name, email, password_hash, role, group_id)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, name, email, role, group_id, is_verified, created_at
                """,
                (name, email, password_hash, role, group_id),
            )
            row = cur.fetchone()
        conn.commit()
        return row


def store_verification_code(user_id: int, code: str):
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO email_verification_tokens (user_id, token, expires_at)
                VALUES (%s, %s, NOW() + INTERVAL '15 minutes')
                """,
                (user_id, code),
            )
        conn.commit()


def find_active_verification_code(user_id: int, code: str):
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, user_id
                FROM email_verification_tokens
                WHERE user_id = %s AND token = %s AND used = false AND expires_at > NOW()
                ORDER BY created_at DESC
                LIMIT 1
                """,
                (user_id, code),
            )
            return cur.fetchone()


def mark_user_verified(user_id: int):
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("UPDATE users SET is_verified = true, email_verified_at = NOW() WHERE id = %s", (user_id,))
            cur.execute("UPDATE email_verification_tokens SET used = true WHERE user_id = %s AND used = false", (user_id,))
        conn.commit()
