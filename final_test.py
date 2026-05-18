#!/usr/bin/env python
"""
اختبار نهائي شامل لموقع Barka
Final Comprehensive Test for Barka Store
"""

from app import app, get_db, init_db
from flask import json
import sys

def test_database():
    """اختبر قاعدة البيانات"""
    print("\n📊 اختبار قاعدة البيانات...")
    success = True
    
    with app.app_context():
        db = get_db()
        
        # الجداول المطلوبة
        required_tables = ['products', 'orders', 'reviews', 'coupons', 'analytics']
        tables = db.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
        table_names = {t[0] for t in tables}
        
        for table in required_tables:
            status = "✓" if table in table_names else "✗"
            print(f"  {status} {table}")
            if table not in table_names:
                success = False
        
        # عدد المنتجات
        count = db.execute("SELECT COUNT(*) as cnt FROM products").fetchone()
        print(f"\n  ✓ عدد المنتجات: {count['cnt']}")
        
        # عدد الكوبونات
        coupons = db.execute("SELECT COUNT(*) as cnt FROM coupons WHERE is_active = 1").fetchone()
        print(f"  ✓ عدد الكوبونات النشطة: {coupons['cnt']}")

    return success

def test_apis():
    """اختبر API endpoints"""
    print("\n🔌 اختبار API Endpoints...")
    success = True
    
    with app.app_context():
        client = app.test_client()
        
        tests = [
            ("GET", "/api/search?q=phone&limit=5", "البحث الحي"),
            ("GET", "/api/reviews?product_id=1", "جلب التقييمات"),
            ("POST", "/api/cart/update", "تحديث السلة", {"product_id": 7, "quantity": 0}),
            ("POST", "/api/coupon/validate", "التحقق من الكوبون", {"code": "WELCOME10"}),
        ]
        
        for method, endpoint, name, *body_data in tests:
            try:
                if method == "GET":
                    response = client.get(endpoint)
                else:
                    body = body_data[0] if body_data else {}
                    response = client.post(endpoint, json=body, content_type='application/json')
                
                status = "✓" if response.status_code < 400 else "✗"
                print(f"  {status} {name} ({response.status_code})")
                if response.status_code >= 400:
                    success = False
            except Exception as e:
                print(f"  ✗ {name} - {str(e)}")
                success = False

    return success


def test_admin_dashboard():
    """اختبر لوحة الإدارة والعمليات الإدارية الأساسية"""
    print("\n🛠️ اختبار لوحة الإدارة...")
    success = True

    with app.app_context():
        client = app.test_client()
        with client.session_transaction() as session:
            session["is_admin"] = True

        response = client.get("/admin")
        status = "✓" if response.status_code < 400 else "✗"
        print(f"  {status} لوحة الإدارة ({response.status_code})")
        if response.status_code >= 400:
            success = False

    return success

def test_files():
    """اختبر الملفات الأساسية"""
    print("\n📁 اختبار الملفات...")
    success = True
    
    from pathlib import Path
    
    required_files = [
        ("app.py", "Flask Application"),
        ("static/js/lazy-load.js", "Lazy Loading"),
        ("static/js/cart-manager.js", "Cart Management"),
        ("static/js/live-search.js", "Live Search"),
        ("static/js/reviews.js", "Reviews System"),
        ("static/js/advanced-filters.js", "Advanced Filters"),
        ("static/js/coupon-manager.js", "Coupon Manager"),
        ("templates/base.html", "Base Template"),
        ("templates/product.html", "Product Template"),
        ("templates/cart.html", "Cart Template"),
    ]
    
    base_path = Path(__file__).parent
    
    for filepath, description in required_files:
        full_path = base_path / filepath
        status = "✓" if full_path.exists() else "✗"
        print(f"  {status} {description}")
        if not full_path.exists():
            success = False

    return success

def main():
    """التشغيل الرئيسي"""
    print("""
╔════════════════════════════════════════════╗
║   اختبار موقع Barka E-Commerce            ║
║   Barka E-Commerce Final Test Suite        ║
╚════════════════════════════════════════════╝
""")
    
    try:
        db_ok = test_database()
        api_ok = test_apis()
        files_ok = test_files()
        admin_ok = test_admin_dashboard()
        all_ok = db_ok and api_ok and files_ok and admin_ok

        if not all_ok:
            print("""
╔════════════════════════════════════════════╗
║   ❌ النتيجة: يوجد اختبار فاشل             ║
║   Result: One or more tests failed         ║
╚════════════════════════════════════════════╝
""")
            sys.exit(1)

        print("""
╔════════════════════════════════════════════╗
║   ✅ النتيجة: جميع الاختبارات نجحت!         ║
║   Result: All Tests Passed!                ║
║                                            ║
║   الموقع جاهز للإطلاق على Render           ║
║   Site Ready for Render Deployment        ║
╚════════════════════════════════════════════╝

🚀 الخطوات التالية / Next Steps:
   
   1. اختبر الموقع محلياً:
      python -m flask run --port=5000
   
   2. تحقق من الميزات:
      - اختبر البحث الحي
      - جرب المرشحات
      - أضف تقييماً
      - طبق كوبوناً
   
   3. استنسخ إلى Render:
      git push origin main
   
   4. عيّن متغيرات البيئة على Render:
      - MM_TELEGRAM_BOT_TOKEN
      - MM_TELEGRAM_CHAT_ID
""")
        
    except Exception as e:
        print(f"\n❌ خطأ: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
