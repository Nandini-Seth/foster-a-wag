/**
 * Seeds demo fosters, a demo rescue, and six pets — the data that used to be
 * inserted automatically on first database access.
 *
 *   npm run seed
 *
 * Guarded twice over, because this writes fictional accounts with published
 * passwords: it refuses to run when NODE_ENV is production, and requires
 * ALLOW_SEED=true to be set explicitly.
 */
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Pool } from 'pg';
import { loadEnv } from './load-env.mjs';

loadEnv();

const DEMO_PASSWORD = 'password123';
const DEMO_RESCUE_EMAIL = 'rescue@demo.com';
const DEMO_FOSTER_EMAIL = 'foster@demo.com';

const PETS = [
  { name: 'Biscuit', species: 'Dog', breed: 'Golden Retriever Mix', age: 3, sex: 'Male', city: 'Toronto', province: 'ON', houseTrained: true, goodWithKids: true, goodWithDogs: true, goodWithCats: false, spayed: true, vaccinated: true, weight: 28, photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=80', bio: 'Biscuit is a gentle, affectionate boy who loves cuddles and long walks. Great with kids and other dogs, and fully house trained.' },
  { name: 'Luna', species: 'Cat', breed: 'Domestic Shorthair', age: 2, sex: 'Female', city: 'Mississauga', province: 'ON', houseTrained: true, goodWithKids: true, goodWithDogs: false, goodWithCats: true, spayed: true, vaccinated: true, weight: 4, photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80', bio: 'Luna is a playful and curious calico who loves window perches and interactive toys. Fully spayed and up to date on vaccines.' },
  { name: 'Maple', species: 'Dog', breed: 'Beagle', age: 1, sex: 'Female', city: 'Hamilton', province: 'ON', houseTrained: false, goodWithKids: true, goodWithDogs: true, goodWithCats: false, spayed: false, vaccinated: true, weight: 10, photo: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80', bio: 'Maple is an energetic, curious pup who needs an active foster home. Learning commands quickly and loves exploring outside.' },
  { name: 'Shadow', species: 'Cat', breed: 'Maine Coon Mix', age: 5, sex: 'Male', city: 'Toronto', province: 'ON', houseTrained: true, goodWithKids: false, goodWithDogs: false, goodWithCats: true, spayed: true, vaccinated: true, weight: 7, photo: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&q=80', bio: 'Shadow is a calm, quiet cat who prefers a peaceful home. Good with older children and other calm cats. Very affectionate once warmed up.' },
  { name: 'Peanut', species: 'Dog', breed: 'Chihuahua Mix', age: 4, sex: 'Male', city: 'Toronto', province: 'ON', houseTrained: true, goodWithKids: false, goodWithDogs: false, goodWithCats: false, spayed: true, vaccinated: true, weight: 3, photo: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600&q=80', bio: 'Peanut is a spunky little guy with a huge personality. Does best in a quiet home without young children. Loves being the center of attention.' },
  { name: 'Daisy', species: 'Dog', breed: 'Labrador Mix', age: 2, sex: 'Female', city: 'Brampton', province: 'ON', houseTrained: true, goodWithKids: true, goodWithDogs: true, goodWithCats: true, spayed: true, vaccinated: true, weight: 22, photo: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&q=80', bio: 'Daisy is a social butterfly who loves everyone she meets. Great with kids, dogs, and cats. Looking for an active family to keep up with her!' },
];

function today(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to seed: NODE_ENV is production.');
    process.exit(1);
  }
  if (process.env.ALLOW_SEED !== 'true') {
    console.error('Refusing to seed: set ALLOW_SEED=true to confirm this is not a real database.');
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString, max: 1 });

  try {
    // Only guards against seeding twice. Real accounts sitting alongside the demo
    // data are fine and are never modified — NODE_ENV and ALLOW_SEED are what
    // keep this away from a production database.
    const existing = await pool.query('SELECT email FROM users WHERE email = ANY($1)', [
      [DEMO_RESCUE_EMAIL, DEMO_FOSTER_EMAIL],
    ]);
    if (existing.rows.length > 0) {
      console.error(
        `Refusing to seed: demo accounts already exist (${existing.rows.map((r) => r.email).join(', ')}).`
      );
      process.exit(1);
    }

    const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

    const rescueUserId = uuidv4();
    const rescueProfileId = uuidv4();
    await pool.query(
      `INSERT INTO users (id, email, password_hash, role, email_verified, status, activated_at)
       VALUES ($1, $2, $3, 'RESCUE', true, 'ACTIVE', now())`,
      [rescueUserId, DEMO_RESCUE_EMAIL, hash]
    );
    await pool.query(
      `INSERT INTO rescue_profiles (id, user_id, org_name, phone, city, province, contact_email)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [rescueProfileId, rescueUserId, 'Paws & Hearts Rescue', '416-555-0101', 'Toronto', 'ON', 'rescue@demo.com']
    );

    const fosterUserId = uuidv4();
    const fosterProfileId = uuidv4();
    await pool.query(
      `INSERT INTO users (id, email, password_hash, role, email_verified, status, activated_at)
       VALUES ($1, $2, $3, 'FOSTER', true, 'ACTIVE', now())`,
      [fosterUserId, DEMO_FOSTER_EMAIL, hash]
    );
    await pool.query(
      `INSERT INTO foster_profiles
         (id, user_id, full_name, phone, city, province, postal_code, dwelling_type,
          fenced_backyard, num_adults, num_children, preferences, available_from, profile_complete)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        fosterProfileId, fosterUserId, 'Alex Johnson', '647-555-0202', 'Toronto', 'ON', 'M4B 1B5',
        'house', true, 2, 1,
        JSON.stringify({ species: ['Dog', 'Cat'], size: ['medium', 'large'], ageGroup: ['adult'], specialNeeds: false }),
        today(), true,
      ]
    );

    for (let i = 0; i < PETS.length; i++) {
      const pet = PETS[i];
      await pool.query(
        `INSERT INTO pets
           (id, rescue_id, name, species, breed, age_years, sex, weight_kg,
            house_trained, spayed_neutered, vaccinated,
            good_with_kids, good_with_dogs, good_with_cats,
            bio, available_from, city, province, primary_photo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [
          uuidv4(), rescueProfileId, pet.name, pet.species, pet.breed, pet.age, pet.sex, pet.weight,
          pet.houseTrained, pet.spayed, pet.vaccinated,
          pet.goodWithKids, pet.goodWithDogs, pet.goodWithCats,
          pet.bio, today(i), pet.city, pet.province, pet.photo,
        ]
      );
    }

    console.log(`Seeded 1 rescue, 1 foster, and ${PETS.length} pets.`);
    console.log(`Demo logins: rescue@demo.com / foster@demo.com (password: ${DEMO_PASSWORD})`);
    console.log('Create an admin separately with: npm run create-admin -- <email>');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
