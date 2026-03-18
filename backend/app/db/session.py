from psycopg import connect
from psycopg.rows import dict_row

from app.core.config import settings


def db_conn():
    return connect(
        host=settings.pghost,
        port=settings.pgport,
        dbname=settings.pgdatabase,
        user=settings.pguser,
        password=settings.pgpassword,
        row_factory=dict_row,
    )


def check_db_health() -> None:
    with db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1")
            cur.fetchone()
