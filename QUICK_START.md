# Quick Start Guide

Get your Maldives Excursion Platform running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages for both frontend and backend.

## Step 2: Set Up Database

```bash
npm run setup
```

This creates the SQLite database and adds:
- Admin account: `admin@maldives.com` / `admin123`
- Sample provider: `provider@example.com` / `provider123`
- 3 sample trips in Male

## Step 3: Start the Application

```bash
npm run dev
```

This starts both the backend (port 3001) and frontend (port 3000) servers.

## Step 4: Access the Platform

Open your browser and go to: **http://localhost:3000**

## What to Try

### As a Tourist (No Login Required)
1. Browse trips at http://localhost:3000/trips
2. Click on a trip and book it
3. You'll get a booking code and QR code!
4. Try submitting a bid (lower price)
5. Try submitting a custom request

### As a Provider
1. Login at http://localhost:3000/login
   - Email: `provider@example.com`
   - Password: `provider123`
2. View your dashboard
3. Create a new trip
4. View bookings
5. Try upgrading to Pro (submit offline payment)

### As an Admin
1. Login at http://localhost:3000/login
   - Email: `admin@maldives.com`
   - Password: `admin123`
2. View platform statistics
3. Go to "Manage Providers"
4. Click edit on the provider
5. Change subscription type or set custom commission rate
6. View pending subscription payments

## Key Features to Test

✅ **Tourist Booking Flow**
- Browse → Select Trip → Book → Get QR Code

✅ **Bid Submission**
- Select Trip → Submit Bid → Provider Responds (login as provider)

✅ **Custom Request**
- Submit Request → Provider Submits Proposal (Pro/VIP only)

✅ **Provider Trip Management**
- Create Trip → Edit → Hide/Show

✅ **Subscription Management**
- Provider submits offline payment → Admin approves → Subscription activated

✅ **Commission Calculation**
- Provider marks booking as completed → Commission recorded based on subscription tier or custom rate

## Troubleshooting

**"Port already in use" error?**
- Change ports in `vite.config.js` and `server/index.js`

**Cannot see sample data?**
- Run `npm run setup` again (it's safe to run multiple times)

**Database errors?**
- Delete `database.db` file and run `npm run setup`

## Next Steps

1. Customize the sample trips with real data
2. Add your own provider accounts
3. Test the complete booking workflow
4. Configure for production deployment (see README.md)

## Need Help?

Check the full README.md for:
- Complete API documentation
- Deployment options
- Security considerations
- Advanced configuration

---

**Enjoy building your excursion platform! 🏝️**
