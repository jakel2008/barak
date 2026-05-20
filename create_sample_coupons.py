import sqlite3
from datetime import datetime, timedelta

from app import app, init_db


COUPONS = [
    {
        "code": "WELCOME10",
        "name": "خصم الترحيب",
        "discount_type": "percentage",
        "discount_value": 10,
        "expiry_date": (datetime.now() + timedelta(days=30)).isoformat(),
    },
    {
        "code": "SAVE50",
        "name": "توفير 50 درهم",
        "discount_type": "fixed",
        "discount_value": 50,
        "expiry_date": (datetime.now() + timedelta(days=60)).isoformat(),
    },
    {
        "code": "SPRING20",
        "name": "خصم الربيع 20%",
        "discount_type": "percentage",
        "discount_value": 20,
        "expiry_date": (datetime.now() + timedelta(days=7)).isoformat(),
    },
    {
        "code": "VIP100",
        "name": "خصم VIP",
        "discount_type": "fixed",
        "discount_value": 100,
        "expiry_date": (datetime.now() + timedelta(days=90)).isoformat(),
    },
]


def main():
    with app.app_context():
        init_db()
        database_path = app.config["DATABASE"]
        connection = sqlite3.connect(database_path)
        cursor = connection.cursor()

        print(f"Seeding coupons into: {database_path}")
        for coupon in COUPONS:
            try:
                cursor.execute(
                    """
                    INSERT OR IGNORE INTO coupons (
                        code, name, discount_type, discount_value, is_active, expiry_date
                    )
                    VALUES (?, ?, ?, ?, 1, ?)
                    """,
                    (
                        coupon["code"],
                        coupon["name"],
                        coupon["discount_type"],
                        coupon["discount_value"],
                        coupon["expiry_date"],
                    ),
                )
                print(f"[ok] {coupon['code']}")
            except sqlite3.DatabaseError as error:
                print(f"[error] {coupon['code']}: {error}")

        connection.commit()

        cursor.execute(
            "SELECT code, name, discount_type, discount_value, is_active FROM coupons ORDER BY created_at DESC"
        )
        print("\nCoupons in database:")
        for row in cursor.fetchall():
            status = "active" if row[4] else "inactive"
            print(f"- {row[0]}: {row[1]} ({row[3]} {row[2]}) [{status}]")

        connection.close()


if __name__ == "__main__":
    main()
