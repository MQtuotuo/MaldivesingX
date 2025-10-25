# Maldives Excursion Platform - MVP

A comprehensive platform for booking excursions in the Maldives. This MVP allows tourists to browse trips, make bookings, submit bids, and request custom excursions. Providers can manage their trips, respond to bids, and handle bookings. Admins can manage providers, adjust subscriptions and commissions manually.

## Features

### Tourist Features (No Login Required)
- Browse trips by island, price range, and activity type
- View detailed trip information
- Book trips instantly with on-site payment
- Submit bids for better prices
- Submit custom trip requests
- Get QR codes and booking codes for confirmation
- View booking details using booking code

### Provider Features (Login Required)
- Dashboard with business statistics
- Create, edit, and manage trips
- View and manage bookings
- Mark bookings as completed (triggers commission calculation)
- View and respond to bids (Pro/VIP only)
- View and respond to custom requests (Pro/VIP only)
- Subscription management with offline payment option
- Multiple subscription tiers:
  - **Free**: $0/month, 15% commission, no bid/request access
  - **Pro**: $29/month, 8% commission, full bid/request access
  - **VIP**: $99/month, 6% commission, priority exposure

### Admin Features
- Platform dashboard with revenue statistics
- Manage all providers
- **Manually adjust provider subscription type**
- **Manually set custom commission rates for any provider**
- View all bookings and statistics
- Approve/reject offline subscription payments
- Audit log for tracking changes
- Export bookings to CSV

## Technology Stack

- **Frontend**: React 18, React Router, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT (JSON Web Tokens)
- **QR Code Generation**: qrcode library
- **Build Tool**: Vite

## Prerequisites

- Node.js 16+ and npm installed
- Git (optional, for cloning)

## Installation

1. **Clone or download the repository**:
```bash
git clone <repository-url>
cd maldives-excursion-platform
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up the database and create sample data**:
```bash
npm run setup
```

This will create:
- Admin account: `admin@maldives.com` / `admin123`
- Provider account: `provider@example.com` / `provider123`
- Sample trips for testing

## Running the Application

### Development Mode

Run both frontend and backend concurrently:

```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### Production Build

1. Build the frontend:
```bash
npm run build
```

2. Run the backend server:
```bash
npm run server
```

3. Serve the built frontend using a static file server (e.g., serve, nginx)

## Default Accounts

After running `npm run setup`, you can log in with:

### Admin Account
- Email: `admin@maldives.com`
- Password: `admin123`
- Access: Full platform management, provider/subscription administration

### Sample Provider Account
- Email: `provider@example.com`
- Password: `provider123`
- Access: Provider dashboard, trip management, booking management

## Project Structure

```
maldives-excursion-platform/
├── server/
│   ├── index.js          # Express server with all API routes
│   ├── database.js       # Database schema and initialization
│   └── setup.js          # Database setup script
├── src/
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── TripListPage.jsx
│   │   ├── TripDetailPage.jsx
│   │   ├── BookingConfirmationPage.jsx
│   │   ├── SubmitBidPage.jsx
│   │   ├── SubmitRequestPage.jsx
│   │   ├── ViewBookingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── provider/
│   │   │   ├── ProviderDashboard.jsx
│   │   │   ├── ProviderTrips.jsx
│   │   │   ├── ProviderBookings.jsx
│   │   │   ├── ProviderBids.jsx
│   │   │   ├── ProviderRequests.jsx
│   │   │   └── ProviderSubscription.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminProviders.jsx
│   │       ├── AdminBookings.jsx
│   │       └── AdminSubscriptions.jsx
│   ├── components/
│   │   └── Navbar.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── database.db            # SQLite database (created after setup)
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Database Schema

### Tables

1. **users** - Stores providers and admins
2. **trips** - Excursion listings
3. **bookings** - Tourist bookings with QR codes
4. **bids** - Price negotiation requests
5. **requests** - Custom trip requests from tourists
6. **request_responses** - Provider responses to requests
7. **subscription_transactions** - Offline payment tracking
8. **audit_log** - Admin action tracking

## Key Features Implementation

### QR Code & Booking Code
- Every booking generates a unique 10-character code
- QR code contains booking details in JSON format
- Tourists can view/download QR codes for check-in

### Commission Calculation
- Automatic commission calculation based on subscription tier
- Admin can set custom commission rates per provider
- Commission recorded when booking is marked as completed

### Subscription Management
- Providers can pay subscriptions offline (bank transfer, cash, etc.)
- Admin reviews and approves/rejects payments
- Admin sets subscription validity period
- Admin can manually change any provider's subscription type

### Bid System
- Tourists propose prices for trips
- Providers can accept, decline, or counter-offer
- Accepted bids automatically create bookings
- Only Pro/VIP providers can view bids

### Custom Requests
- Tourists describe desired experiences
- Pro/VIP providers in the same island can submit proposals
- Open marketplace for custom excursions

## API Endpoints

### Public APIs
- `GET /api/trips` - List all trips (with filters)
- `GET /api/trips/:id` - Get trip details
- `POST /api/bookings` - Create a booking
- `GET /api/bookings/code/:code` - Get booking by code
- `POST /api/bids` - Submit a bid
- `POST /api/requests` - Submit a custom request
- `GET /api/islands` - Get list of islands

### Authentication
- `POST /api/auth/register` - Register as provider
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Provider APIs (Authenticated)
- `GET /api/provider/trips` - Get provider's trips
- `POST /api/trips` - Create trip
- `PUT /api/trips/:id` - Update trip
- `GET /api/provider/bookings` - Get provider's bookings
- `PUT /api/provider/bookings/:id` - Update booking status
- `GET /api/provider/bids` - Get bids (Pro/VIP only)
- `PUT /api/provider/bids/:id` - Respond to bid
- `GET /api/provider/requests` - Get custom requests (Pro/VIP only)
- `POST /api/provider/requests/:id/respond` - Respond to request
- `POST /api/provider/subscription/offline-payment` - Submit offline payment
- `GET /api/provider/subscription/transactions` - Get payment history

### Admin APIs (Admin Only)
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/providers` - List all providers
- `PUT /api/admin/providers/:id/subscription` - Update provider subscription/commission
- `GET /api/admin/bookings` - List all bookings
- `GET /api/admin/subscription/pending` - Pending payments
- `PUT /api/admin/subscription/:id/approve` - Approve/reject payment
- `GET /api/admin/audit-log` - View audit log

## Customization

### Changing Commission Rates

Edit default rates in `server/index.js`:
```javascript
const rates = {
  'free': 0.15,  // 15%
  'pro': 0.08,   // 8%
  'vip': 0.06    // 6%
};
```

### Changing Subscription Prices

Update prices in `src/pages/provider/ProviderSubscription.jsx`:
```javascript
const plans = [
  { id: 'free', price: 0, ... },
  { id: 'pro', price: 29, ... },
  { id: 'vip', price: 99, ... },
];
```

### Adding More Islands

Islands are automatically populated from trips. Just create trips for new islands, and they'll appear in the filters.

## Security Considerations

### For Production Deployment:

1. **Change JWT Secret**: Update `JWT_SECRET` in `server/index.js` to a strong random string

2. **Use Environment Variables**:
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const PORT = process.env.PORT || 3001;
```

3. **Enable HTTPS**: Use SSL/TLS certificates for secure connections

4. **Database Backup**: Regularly backup `database.db`

5. **Rate Limiting**: Add rate limiting middleware to prevent abuse

6. **Input Validation**: Consider adding validation libraries like `joi` or `yup`

7. **CORS Configuration**: Restrict CORS to your frontend domain

## Deployment Options

### Option 1: Single VPS (Recommended for MVP)

1. Use a service like DigitalOcean, Linode, or AWS EC2
2. Install Node.js and a process manager (PM2)
3. Clone the repository
4. Run `npm install` and `npm run setup`
5. Build the frontend: `npm run build`
6. Serve using nginx or Apache
7. Use PM2 to keep the server running:
```bash
pm2 start server/index.js --name "maldives-api"
```

### Option 2: Separate Frontend & Backend

**Frontend**: Deploy to Netlify, Vercel, or Cloudflare Pages
- Build: `npm run build`
- Deploy the `dist/` folder

**Backend**: Deploy to Render, Railway, or Heroku
- Set up database (consider PostgreSQL for production)
- Configure environment variables
- Deploy backend code

### Option 3: Docker

Create a `Dockerfile` and `docker-compose.yml` for containerized deployment.

## Testing Checklist

- [ ] Tourist can browse and filter trips
- [ ] Tourist can book a trip and receive booking code + QR
- [ ] Tourist can submit a bid
- [ ] Tourist can submit a custom request
- [ ] Tourist can view booking using booking code
- [ ] Provider can register and login
- [ ] Provider can create/edit trips
- [ ] Provider can view and manage bookings
- [ ] Provider can mark booking as completed
- [ ] Pro provider can view and respond to bids
- [ ] Pro provider can view and respond to custom requests
- [ ] Provider can submit offline subscription payment
- [ ] Admin can login
- [ ] Admin can view platform statistics
- [ ] Admin can manually change provider subscription type
- [ ] Admin can set custom commission rate for provider
- [ ] Admin can approve/reject offline payments
- [ ] Commission is calculated correctly based on subscription/custom rate

## Troubleshooting

### Database Issues
- Delete `database.db` and run `npm run setup` again

### Port Already in Use
- Change ports in `vite.config.js` (frontend) and `server/index.js` (backend)

### Cannot Connect to Backend
- Ensure backend is running on port 3001
- Check proxy configuration in `vite.config.js`

## Future Enhancements (Phase 2)

- [ ] Email/WhatsApp notifications
- [ ] Online payment integration (Stripe, PayPal)
- [ ] Provider ratings and reviews
- [ ] Photo gallery for trips
- [ ] Calendar availability management
- [ ] Multi-language support
- [ ] Mobile apps (React Native)
- [ ] Advanced analytics dashboard
- [ ] Automated subscription renewal reminders
- [ ] Tourist account system with booking history

## Support

For issues or questions:
1. Check this README thoroughly
2. Review the code comments
3. Test with the provided demo accounts

## License

This project is for demonstration purposes as an MVP. Modify and use as needed for your business.

---

**Built with ❤️ for the Maldives tourism industry**
