import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const DEFAULT_PATH = path.resolve(process.cwd(), 'data', 'app.db');
export const dbFile = process.env.SQLITE_DB_PATH || DEFAULT_PATH;

// Ensure parent folder exists
fs.mkdirSync(path.dirname(dbFile), { recursive: true });

const db = new Database(dbFile);
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');
db.pragma('synchronous = NORMAL');


// Create table (extend as needed)
db.exec(`
CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  social_media TEXT,
  business_niche TEXT NOT NULL,
  logo_filename TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`);

export interface RegistrationRecord {
  businessName: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  socialMedia?: string;
  businessNiche: string;
  logoFilename?: string | null;
}

const insertStmt = db.prepare(`
INSERT INTO registrations
  (business_name, first_name, last_name, email, password_hash, social_media, business_niche, logo_filename)
VALUES
  (@businessName, @firstName, @lastName, @email, @passwordHash, @socialMedia, @businessNiche, @logoFilename)
`);

export function insertRegistration(rec: RegistrationRecord) {
  return insertStmt.run(rec);
}

export function getRegistrationByEmail(email: string) {
  return db.prepare(`SELECT * FROM registrations WHERE email = ?`).get(email);
}

export function listRegistrations(limit = 50) {
  return db.prepare(`SELECT * FROM registrations ORDER BY id DESC LIMIT ?`).all(limit);
}

export function health() {
  const row = db.prepare(`SELECT 1 as ok`).get();
  return !!row;
}