CREATE TABLE hopes (
  id TEXT PRIMARY KEY,
  text TEXT,
  age INTEGER,
  state TEXT NOT NULL CHECK (state IN ('shared', 'withdrawn', 'flagged')),
  key_hash TEXT NOT NULL UNIQUE,
  consent_version TEXT NOT NULL,
  created INTEGER NOT NULL,
  expires INTEGER NOT NULL,
  CHECK ((state = 'shared' AND text IS NOT NULL AND age IS NOT NULL AND age BETWEEN 1 AND 120)
    OR (state <> 'shared' AND text IS NULL AND age IS NULL))
);
CREATE INDEX public_hopes ON hopes(state, expires);
CREATE INDEX expiring_hopes ON hopes(expires);
