import sqlite3, json, os, sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

conn = sqlite3.connect(os.path.join(os.path.dirname(__file__), '..', 'rokhas.db'))
c = conn.cursor()
c.execute("select id, title, owner_id, permit_documents from dossiers")
rows = c.fetchall()

UPLOADS_DIR = os.path.join(os.path.dirname(__file__), '..', 'uploads')

for row in rows:
    docs = json.loads(row[3]) if row[3] else []
    if not docs:
        continue
    print(f"\nDossier {row[0]} (owner_id={row[2]}): {row[1]}")
    for doc in docs:
        filename = doc.get('filename', '')
        url = doc.get('url', 'NO_URL')
        key = doc.get('key', '')
        
        # Check dossier-specific path
        dossier_path = os.path.join(UPLOADS_DIR, f"dossier_{row[0]}", filename)
        exists_dossier = os.path.exists(dossier_path)
        
        # Check temporary path by parsing URL
        temp_exists = False
        temp_path = None
        if url and 'temporary-documents' in url:
            # Parse user_id from url
            from urllib.parse import urlparse, parse_qs, unquote
            parsed = urlparse(url)
            stored_filename = unquote(os.path.basename(parsed.path))
            user_id = parse_qs(parsed.query).get('user_id', [None])[0]
            if user_id:
                temp_path = os.path.join(UPLOADS_DIR, 'temporary', f'user_{user_id}', stored_filename)
                temp_exists = os.path.exists(temp_path)
        
        status = "DOSSIER_DIR" if exists_dossier else ("TEMP_DIR" if temp_exists else "MISSING!")
        print(f"  [{status}] key={key}, filename={filename}")
        if temp_path:
            print(f"    temp_path: {temp_path} | exists: {temp_exists}")
        if not exists_dossier and not temp_exists:
            print(f"    dossier_path: {dossier_path}")
            print(f"    url: {url}")
