const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


/* ===============================
   MongoDB Connection
================================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("MongoDB Connection Error:", err));

/* ===============================
   Test Route
================================= */
app.get("/", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

/* ===============================
   User Schema
================================= */
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String }
});

const User = mongoose.model('User', userSchema);

/* ===============================
   Booking Schema
================================= */
const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  userPhone: String,
  userEmail: String,
  houseSize: String,
  moveDate: String,
  price: String,
  pickupAddress: String,
  destinationAddress: String,
  paymentMethod: { type: String, enum: ['cash', 'online'], default: 'cash' },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);

/* ===============================
   Register Route
================================= */
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({
      msg: "User registered successfully",
      user: { id: newUser._id, email: newUser.email }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   Login Route
================================= */
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "User does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Invalid credentials" });

    res.json({
      msg: "Login successful!",
      user: { id: user._id, email: user.email }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   Booking Route
================================= */
app.post('/api/book-move', async (req, res) => {
  try {
    const {
      userId,
      userName,
      userPhone,
      userEmail,
      houseSize,
      moveDate,
      price,
      pickupAddress,
      destinationAddress,
      paymentMethod
    } = req.body;

    if (!pickupAddress || !destinationAddress) {
      return res.status(400).json({
        msg: "Pickup and Destination addresses are required."
      });
    }

    const newBooking = new Booking({
      userId,
      userName,
      userPhone,
      userEmail,
      houseSize,
      moveDate,
      price,
      pickupAddress,
      destinationAddress,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'pending'
    });

    await newBooking.save();

    res.status(201).json({
      msg: "Booking confirmed successfully!"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   Get User Bookings
================================= */
app.get('/api/my-bookings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await Booking
      .find({ userId })
      .sort({ createdAt: -1 });

    res.json(bookings);

  } catch (err) {
    res.status(500).json({
      error: "Could not fetch history"
    });
  }
});

/* ===============================
   IMPORTANT FOR VERCEL
================================= */
module.exports = app;