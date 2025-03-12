const mongoose = require('mongoose');
require('dotenv').config();

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Correct import for User model

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB 🚀'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware to parse JSON
app.use(express.json());

// Sample Route for Testing
app.get('/', (req, res) => {
    res.send('Server is running successfully!');
});

// ---------------------------- CRUD Operations ---------------------------- //

// CREATE - Register a New User
app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!', newUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// READ - Get All Users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// READ - Get User by ID
app.get('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// UPDATE - Update User Details
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User updated successfully!', updatedUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE - Delete User by ID
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully!', deletedUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ---------------------------- Authentication ---------------------------- //

// LOGIN - Authenticate User
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = await user.generateAuthToken();
        res.json({ message: 'Login successful!', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ---------------------------- Server Start ---------------------------- //
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
