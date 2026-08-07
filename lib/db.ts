import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'foster-a-wag.db');

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('FOSTER','RESCUE','ADMIN')),
      email_verified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS foster_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
      full_name TEXT,
      phone TEXT,
      city TEXT,
      province TEXT,
      postal_code TEXT,
      dwelling_type TEXT,
      fenced_backyard INTEGER DEFAULT 0,
      num_adults INTEGER DEFAULT 1,
      num_children INTEGER DEFAULT 0,
      other_pets TEXT DEFAULT '[]',
      preferences TEXT DEFAULT '{}',
      available_from TEXT,
      available_until TEXT,
      reminder_frequency TEXT DEFAULT 'monthly',
      profile_complete INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rescue_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
      org_name TEXT,
      phone TEXT,
      city TEXT,
      province TEXT,
      website TEXT,
      contact_email TEXT,
      address TEXT,
      logo_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pets (
      id TEXT PRIMARY KEY,
      rescue_id TEXT NOT NULL REFERENCES rescue_profiles(id),
      name TEXT NOT NULL,
      species TEXT NOT NULL,
      breed TEXT,
      age_years REAL,
      sex TEXT,
      weight_kg REAL,
      house_trained INTEGER DEFAULT 0,
      spayed_neutered INTEGER DEFAULT 0,
      microchipped INTEGER DEFAULT 0,
      vaccinated INTEGER DEFAULT 0,
      good_with_kids INTEGER DEFAULT 1,
      good_with_dogs INTEGER DEFAULT 1,
      good_with_cats INTEGER DEFAULT 1,
      special_needs TEXT,
      bio TEXT,
      available_from TEXT,
      urgent_by TEXT,
      city TEXT,
      province TEXT,
      status TEXT DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE','IN_FOSTER','ADOPTED','INACTIVE')),
      primary_photo TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS foster_requests (
      id TEXT PRIMARY KEY,
      foster_id TEXT NOT NULL REFERENCES foster_profiles(id),
      pet_id TEXT NOT NULL REFERENCES pets(id),
      message TEXT,
      status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING','UNDER_REVIEW','ACCEPTED','DECLINED')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      foster_id TEXT NOT NULL REFERENCES foster_profiles(id),
      pet_id TEXT NOT NULL REFERENCES pets(id),
      rescue_id TEXT NOT NULL REFERENCES rescue_profiles(id),
      motivation TEXT,
      daily_schedule TEXT,
      vet_ref_name TEXT,
      vet_ref_phone TEXT,
      personal_ref_name TEXT,
      personal_ref_phone TEXT,
      agreed_to_terms INTEGER DEFAULT 0,
      signature TEXT,
      status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING','UNDER_REVIEW','ACCEPTED','DECLINED')),
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Safe migrations — ignored if column already exists
  try { db.exec('ALTER TABLE foster_profiles ADD COLUMN photo_url TEXT'); } catch {}
  try { db.exec('ALTER TABLE rescue_profiles ADD COLUMN logo_url TEXT'); } catch {}
  try { db.exec('ALTER TABLE users ADD COLUMN admin_verified INTEGER DEFAULT 0'); } catch {}
  // Mark existing demo accounts as verified
  try { db.exec("UPDATE users SET admin_verified = 1 WHERE email IN ('rescue@demo.com', 'foster@demo.com', 'admin@fosterwag.com')"); } catch {}

  // Ensure admin user always exists (safe for existing DBs)
  const adminExists = db.prepare("SELECT id FROM users WHERE role = 'ADMIN'").get();
  if (!adminExists) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bcrypt = require('bcryptjs');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { v4: uuidv4 } = require('uuid');
    db.prepare(`INSERT INTO users (id, email, password_hash, role, email_verified, admin_verified) VALUES (?, ?, ?, 'ADMIN', 1, 1)`)
      .run(uuidv4(), 'admin@fosterwag.com', bcrypt.hashSync('admin1234', 10));
    console.log('[db] Admin user created: admin@fosterwag.com / admin1234');
  }

  // Seed demo data if no non-admin users exist yet
  const nonAdminCount = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role != 'ADMIN'").get() as any).c;
  if (nonAdminCount === 0) {
    seedDemoData(db);
  }
}

function seedDemoData(db: Database.Database) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const bcrypt = require('bcryptjs');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { v4: uuidv4 } = require('uuid');

  // Admin account
  const adminUserId = uuidv4();
  db.prepare(`INSERT INTO users (id, email, password_hash, role, email_verified, admin_verified) VALUES (?, ?, ?, 'ADMIN', 1, 1)`)
    .run(adminUserId, 'admin@fosterwag.com', bcrypt.hashSync('admin1234', 10));

  const rescueUserId = uuidv4();
  const rescueProfileId = uuidv4();
  db.prepare(`INSERT INTO users (id, email, password_hash, role, email_verified, admin_verified) VALUES (?, ?, ?, 'RESCUE', 1, 1)`)
    .run(rescueUserId, 'rescue@demo.com', bcrypt.hashSync('password123', 10));
  db.prepare(`INSERT INTO rescue_profiles (id, user_id, org_name, phone, city, province, contact_email) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(rescueProfileId, rescueUserId, 'Paws & Hearts Rescue', '416-555-0101', 'Toronto', 'ON', 'rescue@demo.com');

  const fosterUserId = uuidv4();
  const fosterProfileId = uuidv4();
  db.prepare(`INSERT INTO users (id, email, password_hash, role, email_verified, admin_verified) VALUES (?, ?, ?, 'FOSTER', 1, 1)`)
    .run(fosterUserId, 'foster@demo.com', bcrypt.hashSync('password123', 10));
  db.prepare(`INSERT INTO foster_profiles (id, user_id, full_name, phone, city, province, postal_code, dwelling_type, fenced_backyard, num_adults, num_children, preferences, available_from, profile_complete) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(fosterProfileId, fosterUserId, 'Alex Johnson', '647-555-0202', 'Toronto', 'ON', 'M4B 1B5', 'house', 1, 2, 1,
      JSON.stringify({ species: ['Dog', 'Cat'], size: ['medium', 'large'], ageGroup: ['adult'], specialNeeds: false }),
      new Date().toISOString().split('T')[0], 1);

  const biscuitBio = 'Biscuit is a gentle, affectionate boy who loves cuddles and long walks. Great with kids and other dogs, and fully house trained.';
  const lunaBio = 'Luna is a playful and curious calico who loves window perches and interactive toys. Fully spayed and up to date on vaccines.';
  const mapleBio = 'Maple is an energetic, curious pup who needs an active foster home. Learning commands quickly and loves exploring outside.';
  const shadowBio = 'Shadow is a calm, quiet cat who prefers a peaceful home. Good with older children and other calm cats. Very affectionate once warmed up.';
  const peanutBio = 'Peanut is a spunky little guy with a huge personality. Does best in a quiet home without young children. Loves being the center of attention.';
  const daisyBio = 'Daisy is a social butterfly who loves everyone she meets. Great with kids, dogs, and cats. Looking for an active family to keep up with her!';

  const pets = [
    { name: 'Biscuit', species: 'Dog',  breed: 'Golden Retriever Mix', age: 3,   sex: 'Male',   bio: biscuitBio, city: 'Toronto',     province: 'ON', house_trained: 1, good_with_kids: 1, good_with_dogs: 1, good_with_cats: 0, spayed: 1, vaccinated: 1, weight: 28 },
    { name: 'Luna',    species: 'Cat',  breed: 'Domestic Shorthair',   age: 2,   sex: 'Female', bio: lunaBio,    city: 'Mississauga', province: 'ON', house_trained: 1, good_with_kids: 1, good_with_dogs: 0, good_with_cats: 1, spayed: 1, vaccinated: 1, weight: 4  },
    { name: 'Maple',   species: 'Dog',  breed: 'Beagle',               age: 1,   sex: 'Female', bio: mapleBio,   city: 'Hamilton',    province: 'ON', house_trained: 0, good_with_kids: 1, good_with_dogs: 1, good_with_cats: 0, spayed: 0, vaccinated: 1, weight: 10 },
    { name: 'Shadow',  species: 'Cat',  breed: 'Maine Coon Mix',       age: 5,   sex: 'Male',   bio: shadowBio,  city: 'Toronto',     province: 'ON', house_trained: 1, good_with_kids: 0, good_with_dogs: 0, good_with_cats: 1, spayed: 1, vaccinated: 1, weight: 7  },
    { name: 'Peanut',  species: 'Dog',  breed: 'Chihuahua Mix',        age: 4,   sex: 'Male',   bio: peanutBio,  city: 'Toronto',     province: 'ON', house_trained: 1, good_with_kids: 0, good_with_dogs: 0, good_with_cats: 0, spayed: 1, vaccinated: 1, weight: 3  },
    { name: 'Daisy',   species: 'Dog',  breed: 'Labrador Mix',         age: 2,   sex: 'Female', bio: daisyBio,   city: 'Brampton',    province: 'ON', house_trained: 1, good_with_kids: 1, good_with_dogs: 1, good_with_cats: 1, spayed: 1, vaccinated: 1, weight: 22 },
  ];

  const petPhotos: Record<string, string> = {
    Biscuit: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=80',
    Luna:    'https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=600&q=80',
    Maple:   'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80',
    Shadow:  'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&q=80',
    Peanut:  'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600&q=80',
    Daisy:   'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&q=80',
  };

  for (const pet of pets) {
    const petId = uuidv4();
    const availableFrom = new Date();
    availableFrom.setDate(availableFrom.getDate() + Math.floor(Math.random() * 7));
    db.prepare(`
      INSERT INTO pets (
        id, rescue_id, name, species, breed, age_years, sex, weight_kg,
        house_trained, spayed_neutered, vaccinated,
        good_with_kids, good_with_dogs, good_with_cats,
        bio, available_from, city, province, primary_photo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      petId, rescueProfileId, pet.name, pet.species, pet.breed,
      pet.age, pet.sex, pet.weight,
      pet.house_trained, pet.spayed, pet.vaccinated,
      pet.good_with_kids, pet.good_with_dogs, pet.good_with_cats,
      pet.bio, availableFrom.toISOString().split('T')[0],
      pet.city, pet.province, petPhotos[pet.name] || null
    );
  }

  console.log('Demo data seeded — rescue@demo.com / foster@demo.com (pw: password123) | admin@fosterwag.com (pw: admin1234)');
}

export default getDb;
