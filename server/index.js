const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('Local Services API is running. Access the frontend at http://localhost:5173 (or your Vite port).');
});

// Ensure uploads directory exists
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// --- Booking State Machine ---
const VALID_TRANSITIONS = {
  REQUESTED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

const validateTransition = (oldStatus, newStatus) => {
  return VALID_TRANSITIONS[oldStatus]?.includes(newStatus);
};

// --- API Endpoints ---

// 1. Discovery: Search Services
app.get('/api/services', async (req, res) => {
  const { city, category, query } = req.query;
  const where = {};
  if (city) where.city = city;
  if (category) where.category = category;
  if (query) {
    where.OR = [
      { name: { contains: query } },
      { description: { contains: query } },
    ];
  }
  const services = await prisma.service.findMany({
    where,
    include: { provider: { select: { name: true, profile: true } } },
  });
  res.json(services);
});

// 2. Booking Engine: Create Booking
app.post('/api/bookings', upload.single('requirements'), async (req, res) => {
  const { scheduledAt, address, notes, serviceId, customerId, providerId } = req.body;
  console.log('--- NEW BOOKING REQUEST ---');
  console.log('Body:', JSON.stringify(req.body, null, 2));

  try {
    const booking = await prisma.booking.create({
      data: {
        scheduledAt: new Date(scheduledAt),
        address,
        notes,
        requirementsUrl: req.file ? `/uploads/${req.file.filename}` : null,
        status: 'REQUESTED',
        customer: { connect: { id: customerId } },
        provider: { connect: { id: providerId } },
        service: { connect: { id: serviceId } },
      },
    });
    console.log('Success! Booking ID:', booking.id);
    res.status(201).json(booking);
  } catch (error) {
    console.error('CRITICAL BOOKING FAILURE:');
    console.error('Error Name:', error.name);
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// 3. Provider/Customer Workspace: Get History
app.get('/api/users/:userId/bookings', async (req, res) => {
  const { userId } = req.params;
  const { role } = req.query; // Normally from Auth

  const where = role === 'PROVIDER' ? { providerId: userId } : { customerId: userId };

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      service: true,
      customer: { select: { name: true, email: true } },
      provider: { select: { name: true, email: true } },
      review: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(bookings);
});

// 4. State Machine: Transition Booking
app.patch('/api/bookings/:bookingId/status', upload.single('photo'), async (req, res) => {
  const { bookingId } = req.params;
  const { nextStatus, cancelReason } = req.body;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (!validateTransition(booking.status, nextStatus)) {
    return res.status(400).json({ error: `Illegal transition from ${booking.status} to ${nextStatus}` });
  }

  const updateData = { status: nextStatus };
  if (nextStatus === 'CANCELLED') updateData.cancelReason = cancelReason;
  if (req.file) {
    if (nextStatus === 'IN_PROGRESS') updateData.beforeImageUrl = `/uploads/${req.file.filename}`;
    if (nextStatus === 'COMPLETED') updateData.afterImageUrl = `/uploads/${req.file.filename}`;
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: updateData,
  });

  res.json(updatedBooking);
});

// 5. Trust Layer: Create Review
app.post('/api/reviews', async (req, res) => {
  const { rating, comment, bookingId, customerId } = req.body;
  try {
    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment,
        isApproved: false, // Pending Admin Approval
        booking: { connect: { id: bookingId } },
        customer: { connect: { id: customerId } },
      },
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 6. Admin: Moderation
app.get('/api/admin/reviews/pending', async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { isApproved: false },
    include: { customer: { select: { name: true } }, booking: { include: { service: true } } },
  });
  res.json(reviews);
});

app.patch('/api/admin/reviews/:reviewId/approve', async (req, res) => {
  const { reviewId } = req.params;
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: { isApproved: true },
  });
  res.json(review);
});

// Helper: Seed Initial Users & Services
app.post('/api/seed', async (req, res) => {
  try {
    const admin = await prisma.user.create({ data: { email: 'admin@local.com', name: 'Admin User', role: 'ADMIN' } });
    const customer = await prisma.user.create({ data: { email: 'customer@local.com', name: 'John Doe', role: 'CUSTOMER' } });
    const provider = await prisma.user.create({
      data: {
        email: 'provider@local.com',
        name: 'Pro Handyman',
        role: 'PROVIDER',
        profile: { create: { bio: 'Top rated handyman', city: 'New York', skills: 'Plumbing, Electrical', isOnline: true } },
      }
    });

    await prisma.service.createMany({
      data: [
        { name: 'Leaking Pipe Fix', description: 'Professional pipe repair', category: 'Plumbing', price: 150, city: 'New York', providerId: provider.id },
        { name: 'Modern Kitchen Painting', description: 'Full kitchen wall coating', category: 'Painting', price: 50, priceType: 'HOURLY', city: 'New York', providerId: provider.id },
      ],
    });

    res.json({ message: 'Seeded successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
