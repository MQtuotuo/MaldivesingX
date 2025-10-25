import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '../database.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initializeDatabase() {
  // Users table (Providers and Admin)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'provider',
      name TEXT NOT NULL,
      phone TEXT,
      island TEXT,
      description TEXT,
      image_url TEXT,
      subscription_type TEXT DEFAULT 'free',
      custom_commission_rate REAL,
      subscription_paid_until TEXT,
      subscription_payment_method TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Trips table
  db.exec(`
    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      island TEXT NOT NULL,
      duration TEXT,
      price REAL NOT NULL,
      max_group_size INTEGER,
      activity_type TEXT,
      included_items TEXT,
      optional_addons TEXT,
      images TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (provider_id) REFERENCES users(id)
    )
  `);

  // Bookings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      provider_id INTEGER NOT NULL,
      tourist_name TEXT NOT NULL,
      tourist_whatsapp TEXT NOT NULL,
      booking_date TEXT NOT NULL,
      num_people INTEGER NOT NULL,
      notes TEXT,
      booking_code TEXT UNIQUE NOT NULL,
      qr_code TEXT,
      status TEXT DEFAULT 'pending',
      payment_status TEXT DEFAULT 'pending',
      total_amount REAL NOT NULL,
      commission_amount REAL,
      commission_rate REAL,
      completed_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trip_id) REFERENCES trips(id),
      FOREIGN KEY (provider_id) REFERENCES users(id)
    )
  `);

  // Bids table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bids (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      provider_id INTEGER NOT NULL,
      tourist_name TEXT NOT NULL,
      tourist_whatsapp TEXT NOT NULL,
      proposed_date TEXT NOT NULL,
      num_people INTEGER NOT NULL,
      bid_amount REAL NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'pending',
      provider_response TEXT,
      counter_offer REAL,
      booking_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trip_id) REFERENCES trips(id),
      FOREIGN KEY (provider_id) REFERENCES users(id),
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    )
  `);

  // Custom Requests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tourist_name TEXT NOT NULL,
      tourist_whatsapp TEXT NOT NULL,
      island TEXT NOT NULL,
      preferred_date TEXT,
      num_people INTEGER NOT NULL,
      activity_type TEXT,
      budget_range TEXT,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Request Responses table (providers can respond to requests)
  db.exec(`
    CREATE TABLE IF NOT EXISTS request_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      provider_id INTEGER NOT NULL,
      proposal_description TEXT NOT NULL,
      proposed_price REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES requests(id),
      FOREIGN KEY (provider_id) REFERENCES users(id)
    )
  `);

  // Subscription Transactions table (for offline payments)
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscription_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_id INTEGER NOT NULL,
      subscription_type TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_reference TEXT,
      approved_by INTEGER,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      approved_at TEXT,
      FOREIGN KEY (provider_id) REFERENCES users(id),
      FOREIGN KEY (approved_by) REFERENCES users(id)
    )
  `);

  // Audit Log table (for tracking admin changes)
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      action_type TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id INTEGER NOT NULL,
      old_value TEXT,
      new_value TEXT,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id)
    )
  `);

  console.log('Database initialized successfully');
}

export default db;
