const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['https://educonsultant.netlify.app', 'http://localhost:3000', 'http://127.0.0.1:5500'],
    credentials: true
}));
app.use(express.json());

// MongoDB connection
let db;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://fury8739:sunny_55g@cluster0.k99xpde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

MongoClient.connect(MONGODB_URI, {
    useUnifiedTopology: true,
})
.then(client => {
    console.log('Connected to MongoDB');
    db = client.db('educonsult');
})
.catch(error => {
    console.error('MongoDB connection error:', error);
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'EduConsult API is running!',
        status: 'success',
        timestamp: new Date().toISOString()
    });
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, service, message } = req.body;
        
        // Validate required fields
        if (!name || !email || !phone || !service || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Create contact document
        const contactData = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            service: service.trim(),
            message: message.trim(),
            timestamp: new Date(),
            status: 'new',
            ip: req.ip || req.connection.remoteAddress
        };

        // Insert into MongoDB
        const result = await db.collection('contacts').insertOne(contactData);
        
        console.log('New contact form submission:', {
            id: result.insertedId,
            name: contactData.name,
            email: contactData.email,
            service: contactData.service,
            timestamp: contactData.timestamp
        });

        res.status(201).json({
            success: true,
            message: 'Contact form submitted successfully',
            id: result.insertedId
        });

    } catch (error) {
        console.error('Error saving contact form:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
});

// Get all contacts (for admin use)
app.get('/api/contacts', async (req, res) => {
    try {
        const contacts = await db.collection('contacts')
            .find({})
            .sort({ timestamp: -1 })
            .toArray();
        
        res.json({
            success: true,
            count: contacts.length,
            data: contacts
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contacts'
        });
    }
});

// Get contact by ID
app.get('/api/contacts/:id', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const contact = await db.collection('contacts')
            .findOne({ _id: new ObjectId(req.params.id) });
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }
        
        res.json({
            success: true,
            data: contact
        });
    } catch (error) {
        console.error('Error fetching contact:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contact'
        });
    }
});

// Update contact status
app.patch('/api/contacts/:id/status', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const { status } = req.body;
        
        const validStatuses = ['new', 'contacted', 'in-progress', 'completed', 'closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }
        
        const result = await db.collection('contacts')
            .updateOne(
                { _id: new ObjectId(req.params.id) },
                { 
                    $set: { 
                        status: status,
                        updatedAt: new Date()
                    }
                }
            );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Contact status updated successfully'
        });
    } catch (error) {
        console.error('Error updating contact status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating contact status'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
