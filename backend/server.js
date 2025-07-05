const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/educonsult';
let db;

async function connectToMongoDB() {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db('educonsult');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Contact form submission endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, service, message, timestamp } = req.body;
        
        // Validate required fields
        if (!name || !email || !service || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Insert into MongoDB
        const result = await db.collection('contacts').insertOne({
            name,
            email,
            phone: phone || '',
            service,
            message,
            timestamp: timestamp || new Date().toISOString(),
            status: 'new'
        });

        console.log('Contact form submitted:', { name, email, service });
        
        res.status(200).json({ 
            success: true, 
            message: 'Contact form submitted successfully',
            id: result.insertedId
        });
    } catch (error) {
        console.error('Error saving contact:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all contacts (for admin purposes)
app.get('/api/contacts', async (req, res) => {
    try {
        const contacts = await db.collection('contacts').find({}).sort({ timestamp: -1 }).toArray();
        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
async function startServer() {
    await connectToMongoDB();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();