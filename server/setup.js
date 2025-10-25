import { initializeDatabase } from './database.js';
import db from './database.js';
import bcrypt from 'bcryptjs';

// Initialize database
initializeDatabase();

// Create default admin user
const adminPassword = bcrypt.hashSync('admin123', 10);
try {
  db.prepare(`
    INSERT INTO users (email, password, role, name, phone)
    VALUES (?, ?, ?, ?, ?)
  `).run('admin@maldives.com', adminPassword, 'admin', 'System Admin', '+960-123-4567');
  console.log('✅ Admin user created: admin@maldives.com / admin123');
} catch (err) {
  if (err.message.includes('UNIQUE')) {
    console.log('ℹ️  Admin user already exists');
  } else {
    console.error('Error creating admin:', err);
  }
}

// Create sample provider
const providerPassword = bcrypt.hashSync('provider123', 10);
try {
  const result = db.prepare(`
    INSERT INTO users (email, password, role, name, phone, island, description, subscription_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'provider@example.com',
    providerPassword,
    'provider',
    'Paradise Tours',
    '+960-987-6543',
    'Male',
    'We offer the best excursions in Male with experienced guides.',
    'free'
  );
  
  // Create sample trips for this provider
  const providerId = result.lastInsertRowid;
  
  db.prepare(`
    INSERT INTO trips (provider_id, title, description, island, duration, price, max_group_size, activity_type, included_items, images, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    providerId,
    'Dolphin Watching Sunset Cruise',
    'Experience the magic of Maldivian sunset while watching dolphins play in their natural habitat. This tour includes a traditional Maldivian boat ride and refreshments.',
    'Male',
    '3 hours',
    150,
    12,
    'Water Activities',
    'Boat ride, Refreshments, Guide, Life jackets',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
    'active'
  );

  db.prepare(`
    INSERT INTO trips (provider_id, title, description, island, duration, price, max_group_size, activity_type, included_items, images, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    providerId,
    'Snorkeling Adventure',
    'Discover the vibrant underwater world of the Maldives. Visit multiple snorkeling spots with abundant marine life including tropical fish, rays, and sea turtles.',
    'Male',
    '4 hours',
    120,
    8,
    'Water Activities',
    'Snorkeling gear, Guide, Lunch, Underwater camera photos',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19',
    'active'
  );

  db.prepare(`
    INSERT INTO trips (provider_id, title, description, island, duration, price, max_group_size, activity_type, included_items, images, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    providerId,
    'Local Island Cultural Tour',
    'Immerse yourself in authentic Maldivian culture. Visit local villages, learn about traditional crafts, and enjoy a home-cooked Maldivian meal.',
    'Male',
    '5 hours',
    90,
    15,
    'Cultural',
    'Transportation, Guide, Lunch, Cultural demonstrations',
    'https://images.unsplash.com/photo-1514282401047-d79a71a590e8',
    'active'
  );

  console.log('✅ Sample provider created: provider@example.com / provider123');
  console.log('✅ Sample trips created');
} catch (err) {
  if (err.message.includes('UNIQUE')) {
    console.log('ℹ️  Sample provider already exists');
  } else {
    console.error('Error creating sample data:', err);
  }
}

console.log('\n🎉 Setup complete! You can now start the server.');
console.log('   Run: npm run dev');
