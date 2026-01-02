/*jshint esversion: 8 */
// Task 1: Import necessary packages
const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectToDatabase = require('../models/db');
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino');
// Task 1: Use the `body`,`validationResult` from `express-validator` for input validation
const { body, validationResult } = require('express-validator');

// Task 2: Create a Pino logger instance
const logger = pino();

dotenv.config();

// Task 3: Create JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

// Task 4: Define the /register endpoint
router.post('/register', async (req, res) => {
    try {
        // Task 1: Connect to `giftlink` in MongoDB through `connectToDatabase` in `db.js`
        const db = await connectToDatabase();

        // Task 2: Access MongoDB `users` collection
        const collection = db.collection('users');

        // Task 3: Check if user credentials already exists in the database and throw an error if they do
        const existingEmail = await collection.findOne({ email: req.body.email });
        if (existingEmail) {
            logger.error('Email id already exists');
            return res.status(400).json({ error: 'Email id already exists' });
        }

        // Task 4: Create a hash to encrypt the password so that it is not readable in the database
        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);

        // Task 5: Insert the user into the database
        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date(),
        });

        // Task 6: Create JWT authentication if passwords match with user._id as payload
        const payload = {
            user: {
                id: newUser.insertedId,
            },
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User registered successfully');
        res.json({ authtoken, email: req.body.email });

    } catch (e) {
        logger.error(e);
        return res.status(500).send('Internal server error');
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        // Task 1: Connect to `giftsdb` in MongoDB through `connectToDatabase` in `db.js`
        const db = await connectToDatabase();

        // Task 2: Access MongoDB `users` collection
        const collection = db.collection('users');

        // Task 3: Check for user credentials in database
        const theUser = await collection.findOne({ email: req.body.email });

        // Task 7: Send appropriate message if user not found
        if (!theUser) {
            logger.error('User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        // Task 4: Check if the password matches the encrypted password and send appropriate message on mismatch
        const isMatch = await bcryptjs.compare(req.body.password, theUser.password);
        if (!isMatch) {
            logger.error('Passwords do not match');
            return res.status(404).json({ error: 'Wrong password' });
        }

        // Task 5: Fetch user details from database
        const userName = theUser.firstName;
        const userEmail = theUser.email;

        // Task 6: Create JWT authentication if passwords match with user._id as payload
        const payload = {
            user: {
                id: theUser._id.toString(),
            },
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User logged in successfully');
        res.json({ authtoken, userName, userEmail });

    } catch (e) {
        logger.error(e);
        return res.status(500).send('Internal server error');
    }
});

// Update endpoint
router.put('/update', async (req, res) => {
    // Task 2: Validate the input using `validationResult` and return appropriate message if there is an error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error('Validation errors in update request', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Task 3: Check if `email` is present in the header and throw an appropriate error message if not present
        const email = req.headers.email;
        if (!email) {
            logger.error('Email not found in the request headers');
            return res.status(400).json({ error: 'Email not found in the request headers' });
        }

        // Task 4: Connect to MongoDB
        const db = await connectToDatabase();
        const collection = db.collection('users');

        // Task 5: Find user credentials in database
        const existingUser = await collection.findOne({ email });
        if (!existingUser) {
            logger.error('User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        existingUser.updatedAt = new Date();

        // Task 6: Update user credentials in database
        const updatedUser = await collection.findOneAndUpdate(
            { email },
            { $set: { ...req.body, updatedAt: existingUser.updatedAt } },
            { returnDocument: 'after' }
        );

        // Task 7: Create JWT authentication using secret key from .env file
        const payload = {
            user: {
                id: updatedUser._id.toString(),
            },
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User updated successfully');
        res.json({ authtoken });

    } catch (e) {
        logger.error(e);
        return res.status(500).send('Internal server error');
    }
});

module.exports = router;
