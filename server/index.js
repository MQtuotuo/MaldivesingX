import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { nanoid } from 'nanoid';
import db, { initializeDatabase } from './database.js';

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to verify admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Helper function to get commission rate
function getCommissionRate(user) {
  // If custom commission rate is set, use it
  if (user.custom_commission_rate !== null) {
    return user.custom_commission_rate;
  }
  
  // Otherwise use subscription-based rates
  const rates = {
    'free': 0.15,
    'pro': 0.08,
    'vip': 0.06
  };
  return rates[user.subscription_type] || 0.15;
}

// ========== AUTH ROUTES ==========

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone, island, description } = req.body;
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const result = db.prepare(`
      INSERT INTO users (email, password, role, name, phone, island, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(email, hashedPassword, 'provider', name, phone, island, description);

    const token = jwt.sign(
      { id: result.lastInsertRowid, email, role: 'provider' },
      JWT_SECRET
    );

    res.json({ token, user: { id: result.lastInsertRowid, email, name, role: 'provider' } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscription_type: user.subscription_type
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, name, role, phone, island, description, image_url, subscription_type, custom_commission_rate, subscription_paid_until FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ========== TRIP ROUTES ==========

// Get all trips (public)
app.get('/api/trips', (req, res) => {
  try {
    const { island, activity_type, min_price, max_price } = req.query;
    
    let query = `
      SELECT trips.*, users.name as provider_name, users.phone as provider_phone
      FROM trips
      JOIN users ON trips.provider_id = users.id
      WHERE trips.status = 'active'
    `;
    const params = [];

    if (island) {
      query += ' AND trips.island = ?';
      params.push(island);
    }
    if (activity_type) {
      query += ' AND trips.activity_type = ?';
      params.push(activity_type);
    }
    if (min_price) {
      query += ' AND trips.price >= ?';
      params.push(parseFloat(min_price));
    }
    if (max_price) {
      query += ' AND trips.price <= ?';
      params.push(parseFloat(max_price));
    }

    query += ' ORDER BY trips.created_at DESC';

    const trips = db.prepare(query).all(...params);
    res.json(trips);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get single trip (public)
app.get('/api/trips/:id', (req, res) => {
  try {
    const trip = db.prepare(`
      SELECT trips.*, users.name as provider_name, users.phone as provider_phone, users.description as provider_description
      FROM trips
      JOIN users ON trips.provider_id = users.id
      WHERE trips.id = ?
    `).get(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    res.json(trip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create trip (provider only)
app.post('/api/trips', authenticateToken, (req, res) => {
  try {
    const { title, description, island, duration, price, max_group_size, activity_type, included_items, optional_addons, images } = req.body;
    
    const result = db.prepare(`
      INSERT INTO trips (provider_id, title, description, island, duration, price, max_group_size, activity_type, included_items, optional_addons, images)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, title, description, island, duration, price, max_group_size, activity_type, included_items, optional_addons, images);

    res.json({ id: result.lastInsertRowid, message: 'Trip created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update trip (provider only)
app.put('/api/trips/:id', authenticateToken, (req, res) => {
  try {
    const { title, description, island, duration, price, max_group_size, activity_type, included_items, optional_addons, images, status } = req.body;
    
    db.prepare(`
      UPDATE trips
      SET title = ?, description = ?, island = ?, duration = ?, price = ?, max_group_size = ?, activity_type = ?, included_items = ?, optional_addons = ?, images = ?, status = ?
      WHERE id = ? AND provider_id = ?
    `).run(title, description, island, duration, price, max_group_size, activity_type, included_items, optional_addons, images, status, req.params.id, req.user.id);

    res.json({ message: 'Trip updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get provider's trips
app.get('/api/provider/trips', authenticateToken, (req, res) => {
  try {
    const trips = db.prepare('SELECT * FROM trips WHERE provider_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(trips);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ========== BOOKING ROUTES ==========

// Create booking (public)
app.post('/api/bookings', async (req, res) => {
  try {
    const { trip_id, tourist_name, tourist_whatsapp, booking_date, num_people, notes } = req.body;
    
    // Get trip and provider info
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(trip_id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const provider = db.prepare('SELECT * FROM users WHERE id = ?').get(trip.provider_id);
    const commissionRate = getCommissionRate(provider);
    
    const totalAmount = trip.price * num_people;
    const commissionAmount = totalAmount * commissionRate;
    const bookingCode = nanoid(10).toUpperCase();
    
    // Generate QR code
    const qrData = JSON.stringify({
      bookingCode,
      tripTitle: trip.title,
      tourist: tourist_name,
      date: booking_date,
      people: num_people,
      amount: totalAmount
    });
    const qrCode = await QRCode.toDataURL(qrData);
    
    const result = db.prepare(`
      INSERT INTO bookings (trip_id, provider_id, tourist_name, tourist_whatsapp, booking_date, num_people, notes, booking_code, qr_code, total_amount, commission_amount, commission_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(trip_id, trip.provider_id, tourist_name, tourist_whatsapp, booking_date, num_people, notes, bookingCode, qrCode, totalAmount, commissionAmount, commissionRate);

    res.json({
      id: result.lastInsertRowid,
      booking_code: bookingCode,
      qr_code: qrCode,
      total_amount: totalAmount,
      message: 'Booking created successfully'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get booking by code (public)
app.get('/api/bookings/code/:code', (req, res) => {
  try {
    const booking = db.prepare(`
      SELECT bookings.*, trips.title as trip_title, trips.island, users.name as provider_name, users.phone as provider_phone
      FROM bookings
      JOIN trips ON bookings.trip_id = trips.id
      JOIN users ON bookings.provider_id = users.id
      WHERE bookings.booking_code = ?
    `).get(req.params.code);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get provider's bookings
app.get('/api/provider/bookings', authenticateToken, (req, res) => {
  try {
    const bookings = db.prepare(`
      SELECT bookings.*, trips.title as trip_title, trips.island
      FROM bookings
      JOIN trips ON bookings.trip_id = trips.id
      WHERE bookings.provider_id = ?
      ORDER BY bookings.created_at DESC
    `).all(req.user.id);
    res.json(bookings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update booking status
app.put('/api/provider/bookings/:id', authenticateToken, (req, res) => {
  try {
    const { status, payment_status } = req.body;
    
    const updates = [];
    const params = [];
    
    if (status) {
      updates.push('status = ?');
      params.push(status);
      
      if (status === 'completed') {
        updates.push('completed_at = CURRENT_TIMESTAMP');
      }
    }
    
    if (payment_status) {
      updates.push('payment_status = ?');
      params.push(payment_status);
    }
    
    params.push(req.params.id, req.user.id);
    
    db.prepare(`
      UPDATE bookings
      SET ${updates.join(', ')}
      WHERE id = ? AND provider_id = ?
    `).run(...params);

    res.json({ message: 'Booking updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ========== BID ROUTES ==========

// Create bid (public)
app.post('/api/bids', (req, res) => {
  try {
    const { trip_id, tourist_name, tourist_whatsapp, proposed_date, num_people, bid_amount, notes } = req.body;
    
    const trip = db.prepare('SELECT provider_id FROM trips WHERE id = ?').get(trip_id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    const result = db.prepare(`
      INSERT INTO bids (trip_id, provider_id, tourist_name, tourist_whatsapp, proposed_date, num_people, bid_amount, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(trip_id, trip.provider_id, tourist_name, tourist_whatsapp, proposed_date, num_people, bid_amount, notes);

    res.json({ id: result.lastInsertRowid, message: 'Bid submitted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get provider's bids
app.get('/api/provider/bids', authenticateToken, (req, res) => {
  try {
    // Check if provider has access to bids (pro or vip subscription)
    const provider = db.prepare('SELECT subscription_type FROM users WHERE id = ?').get(req.user.id);
    
    if (provider.subscription_type === 'free') {
      return res.status(403).json({ error: 'Upgrade to Pro or VIP to view bids' });
    }
    
    const bids = db.prepare(`
      SELECT bids.*, trips.title as trip_title, trips.price as original_price
      FROM bids
      JOIN trips ON bids.trip_id = trips.id
      WHERE bids.provider_id = ?
      ORDER BY bids.created_at DESC
    `).all(req.user.id);
    
    res.json(bids);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Respond to bid
app.put('/api/provider/bids/:id', authenticateToken, async (req, res) => {
  try {
    const { status, provider_response, counter_offer } = req.body;
    
    const bid = db.prepare('SELECT * FROM bids WHERE id = ? AND provider_id = ?').get(req.params.id, req.user.id);
    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }

    // If accepting bid, create a booking
    if (status === 'accepted') {
      const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(bid.trip_id);
      const provider = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
      const commissionRate = getCommissionRate(provider);
      
      const finalAmount = counter_offer || bid.bid_amount;
      const totalAmount = finalAmount * bid.num_people;
      const commissionAmount = totalAmount * commissionRate;
      const bookingCode = nanoid(10).toUpperCase();
      
      const qrData = JSON.stringify({
        bookingCode,
        tripTitle: trip.title,
        tourist: bid.tourist_name,
        date: bid.proposed_date,
        people: bid.num_people,
        amount: totalAmount
      });
      const qrCode = await QRCode.toDataURL(qrData);
      
      const bookingResult = db.prepare(`
        INSERT INTO bookings (trip_id, provider_id, tourist_name, tourist_whatsapp, booking_date, num_people, notes, booking_code, qr_code, total_amount, commission_amount, commission_rate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(bid.trip_id, bid.provider_id, bid.tourist_name, bid.tourist_whatsapp, bid.proposed_date, bid.num_people, bid.notes, bookingCode, qrCode, totalAmount, commissionAmount, commissionRate);

      db.prepare(`
        UPDATE bids
        SET status = ?, provider_response = ?, counter_offer = ?, booking_id = ?
        WHERE id = ?
      `).run(status, provider_response, counter_offer, bookingResult.lastInsertRowid, req.params.id);
    } else {
      db.prepare(`
        UPDATE bids
        SET status = ?, provider_response = ?, counter_offer = ?
        WHERE id = ?
      `).run(status, provider_response, counter_offer, req.params.id);
    }

    res.json({ message: 'Bid response recorded successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ========== REQUEST ROUTES ==========

// Create custom request (public)
app.post('/api/requests', (req, res) => {
  try {
    const { tourist_name, tourist_whatsapp, island, preferred_date, num_people, activity_type, budget_range, description } = req.body;
    
    const result = db.prepare(`
      INSERT INTO requests (tourist_name, tourist_whatsapp, island, preferred_date, num_people, activity_type, budget_range, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(tourist_name, tourist_whatsapp, island, preferred_date, num_people, activity_type, budget_range, description);

    res.json({ id: result.lastInsertRowid, message: 'Request submitted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all requests (for pro/vip providers)
app.get('/api/provider/requests', authenticateToken, (req, res) => {
  try {
    const provider = db.prepare('SELECT subscription_type, island FROM users WHERE id = ?').get(req.user.id);
    
    if (provider.subscription_type === 'free') {
      return res.status(403).json({ error: 'Upgrade to Pro or VIP to view requests' });
    }
    
    // Show requests for provider's island
    const requests = db.prepare(`
      SELECT * FROM requests
      WHERE island = ? AND status = 'open'
      ORDER BY created_at DESC
    `).all(provider.island);
    
    res.json(requests);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Respond to request
app.post('/api/provider/requests/:id/respond', authenticateToken, (req, res) => {
  try {
    const { proposal_description, proposed_price } = req.body;
    
    const result = db.prepare(`
      INSERT INTO request_responses (request_id, provider_id, proposal_description, proposed_price)
      VALUES (?, ?, ?, ?)
    `).run(req.params.id, req.user.id, proposal_description, proposed_price);

    res.json({ id: result.lastInsertRowid, message: 'Response submitted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ========== SUBSCRIPTION ROUTES ==========

// Submit offline subscription payment
app.post('/api/provider/subscription/offline-payment', authenticateToken, (req, res) => {
  try {
    const { subscription_type, amount, payment_method, payment_reference } = req.body;
    
    const result = db.prepare(`
      INSERT INTO subscription_transactions (provider_id, subscription_type, amount, payment_method, payment_reference, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.user.id, subscription_type, amount, payment_method, payment_reference, 'pending');

    res.json({ id: result.lastInsertRowid, message: 'Payment submitted for approval' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get provider's subscription transactions
app.get('/api/provider/subscription/transactions', authenticateToken, (req, res) => {
  try {
    const transactions = db.prepare(`
      SELECT * FROM subscription_transactions
      WHERE provider_id = ?
      ORDER BY created_at DESC
    `).all(req.user.id);
    
    res.json(transactions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ========== ADMIN ROUTES ==========

// Get all providers
app.get('/api/admin/providers', authenticateToken, requireAdmin, (req, res) => {
  try {
    const providers = db.prepare(`
      SELECT id, email, name, phone, island, description, subscription_type, custom_commission_rate, subscription_paid_until, created_at
      FROM users
      WHERE role = 'provider'
      ORDER BY created_at DESC
    `).all();
    
    res.json(providers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update provider subscription and commission (admin only)
app.put('/api/admin/providers/:id/subscription', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { subscription_type, custom_commission_rate, subscription_paid_until } = req.body;
    
    const provider = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Log the change
    const oldValue = JSON.stringify({
      subscription_type: provider.subscription_type,
      custom_commission_rate: provider.custom_commission_rate,
      subscription_paid_until: provider.subscription_paid_until
    });
    const newValue = JSON.stringify({ subscription_type, custom_commission_rate, subscription_paid_until });
    
    db.prepare(`
      INSERT INTO audit_log (admin_id, action_type, target_type, target_id, old_value, new_value, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, 'update_subscription', 'provider', req.params.id, oldValue, newValue, `Updated subscription for ${provider.name}`);

    // Update provider
    db.prepare(`
      UPDATE users
      SET subscription_type = ?, custom_commission_rate = ?, subscription_paid_until = ?
      WHERE id = ?
    `).run(subscription_type, custom_commission_rate, subscription_paid_until, req.params.id);

    res.json({ message: 'Provider subscription updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get pending subscription payments
app.get('/api/admin/subscription/pending', authenticateToken, requireAdmin, (req, res) => {
  try {
    const transactions = db.prepare(`
      SELECT st.*, u.name as provider_name, u.email as provider_email
      FROM subscription_transactions st
      JOIN users u ON st.provider_id = u.id
      WHERE st.status = 'pending'
      ORDER BY st.created_at DESC
    `).all();
    
    res.json(transactions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Approve/reject offline subscription payment
app.put('/api/admin/subscription/:id/approve', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { status, subscription_paid_until } = req.body; // status: 'approved' or 'rejected'
    
    const transaction = db.prepare('SELECT * FROM subscription_transactions WHERE id = ?').get(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    db.prepare(`
      UPDATE subscription_transactions
      SET status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, req.user.id, req.params.id);

    if (status === 'approved') {
      // Update provider's subscription
      db.prepare(`
        UPDATE users
        SET subscription_type = ?, subscription_paid_until = ?, subscription_payment_method = ?
        WHERE id = ?
      `).run(transaction.subscription_type, subscription_paid_until, transaction.payment_method, transaction.provider_id);

      // Log the change
      db.prepare(`
        INSERT INTO audit_log (admin_id, action_type, target_type, target_id, new_value, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(req.user.id, 'approve_subscription', 'provider', transaction.provider_id, transaction.subscription_type, `Approved ${transaction.subscription_type} subscription payment`);
    }

    res.json({ message: `Transaction ${status} successfully` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all bookings (admin)
app.get('/api/admin/bookings', authenticateToken, requireAdmin, (req, res) => {
  try {
    const bookings = db.prepare(`
      SELECT bookings.*, trips.title as trip_title, users.name as provider_name
      FROM bookings
      JOIN trips ON bookings.trip_id = trips.id
      JOIN users ON bookings.provider_id = users.id
      ORDER BY bookings.created_at DESC
    `).all();
    
    res.json(bookings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get revenue statistics (admin)
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    const stats = {
      totalBookings: db.prepare('SELECT COUNT(*) as count FROM bookings').get().count,
      completedBookings: db.prepare('SELECT COUNT(*) as count FROM bookings WHERE status = "completed"').get().count,
      totalRevenue: db.prepare('SELECT SUM(total_amount) as total FROM bookings WHERE status = "completed"').get().total || 0,
      totalCommission: db.prepare('SELECT SUM(commission_amount) as total FROM bookings WHERE status = "completed"').get().total || 0,
      activeProviders: db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "provider"').get().count,
      activeTrips: db.prepare('SELECT COUNT(*) as count FROM trips WHERE status = "active"').get().count,
      pendingBids: db.prepare('SELECT COUNT(*) as count FROM bids WHERE status = "pending"').get().count,
      openRequests: db.prepare('SELECT COUNT(*) as count FROM requests WHERE status = "open"').get().count,
    };
    
    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get audit log (admin)
app.get('/api/admin/audit-log', authenticateToken, requireAdmin, (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT audit_log.*, users.name as admin_name
      FROM audit_log
      JOIN users ON audit_log.admin_id = users.id
      ORDER BY audit_log.created_at DESC
      LIMIT 100
    `).all();
    
    res.json(logs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get islands list (public)
app.get('/api/islands', (req, res) => {
  try {
    const islands = db.prepare(`
      SELECT DISTINCT island FROM trips WHERE status = 'active'
      ORDER BY island
    `).all();
    
    res.json(islands.map(i => i.island));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
