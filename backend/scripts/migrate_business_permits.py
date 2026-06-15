import sqlite3
conn = sqlite3.connect('backend/rokhas.db')
c = conn.cursor()
cols = [r[1] for r in c.execute("PRAGMA table_info(business_permits)").fetchall()]
print("existing cols:", cols)
missing = [col for col in ["ai_analysis"] if col not in cols]
for col in missing:
    conn.execute(f"ALTER TABLE business_permits ADD COLUMN {col} VARCHAR")
conn.commit()
print("done, added:", missing)
