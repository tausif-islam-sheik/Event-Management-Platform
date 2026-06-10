const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Event = require('./models/Event');
const OrganizerRequest = require('./models/OrganizerRequest');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await Event.deleteMany();
    await OrganizerRequest.deleteMany();
    console.log('🗑️  Cleared existing data');

    // Create admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@events.com',
      password: 'admin123',
      role: 'admin',
    });

    // Create organizer
    const organizer = await User.create({
      name: 'Event Organizer',
      email: 'organizer@events.com',
      password: 'organizer123',
      role: 'organizer',
    });

    // Create regular users
    const user1 = await User.create({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'user123',
      role: 'user',
    });

    const user2 = await User.create({
      name: 'Bob Smith',
      email: 'bob@example.com',
      password: 'user123',
      role: 'user',
    });

    // Create sample events
    const event1 = await Event.create({
      title: 'React Summit 2026',
      description:
        'The biggest React conference of the year. Join industry leaders, developers, and innovators for two days packed with talks, workshops, and networking opportunities.',
      bannerImage: '',
      organizerId: organizer._id,
      date: new Date('2026-08-15T09:00:00Z'),
      location: 'San Francisco, CA',
      capacity: 500,
      category: 'tech',
      status: 'upcoming',
    });

    const event2 = await Event.create({
      title: 'Jazz & Blues Festival',
      description:
        'A three-day open-air music festival celebrating jazz and blues traditions from around the world. Featuring 20+ artists across 4 stages.',
      bannerImage: '',
      organizerId: organizer._id,
      date: new Date('2026-09-05T14:00:00Z'),
      location: 'New Orleans, LA',
      capacity: 2000,
      category: 'music',
      status: 'upcoming',
    });

    const event3 = await Event.create({
      title: 'City Marathon 2026',
      description:
        'Annual city marathon with 5K, 10K, half marathon, and full marathon categories. Open to runners of all levels.',
      bannerImage: '',
      organizerId: organizer._id,
      date: new Date('2026-10-12T07:00:00Z'),
      location: 'Chicago, IL',
      capacity: 1000,
      category: 'sports',
      status: 'upcoming',
    });

    // Register users for events
    event1.registeredUsers.push(user1._id);
    await event1.save();

    event2.registeredUsers.push(user1._id, user2._id);
    await event2.save();

    console.log('🌱 Seed data inserted successfully!');
    console.log('📋 Accounts created:');
    console.log('   Admin:     admin@events.com     / admin123');
    console.log('   Organizer: organizer@events.com / organizer123');
    console.log('   User 1:    alice@example.com    / user123');
    console.log('   User 2:    bob@example.com      / user123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seed();
