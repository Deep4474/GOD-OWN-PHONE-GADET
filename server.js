const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const nodemailer = require('nodemailer');
// Allow only Netlify frontend
app.use(cors({
    origin: 'https://glittery-torrone-d1184e.netlify.app',
    credentials: true
}));
app.use(express.static(__dirname));
app.use(express.json());
app.use(session({ secret: 'lamar-secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// ...existing code...
// Basic Express server to handle user email and send details to Supabase
// Basic Express server to handle user email and send details to Supabase
// Endpoint to log errors from frontend to terminal
app.post('/api/log-error', (req, res) => {
    console.error('Frontend error:', req.body);
    res.json({ success: true });
});
// ...existing code...

// Test endpoint to simulate POST /api/user-details
// Endpoint to get all users
app.get('/api/users', (req, res) => {
    const filePath = path.join(__dirname, 'user.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Could not read user.json' });
        }
        res.json(JSON.parse(data));
    });
});
// Simple login endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    // For demo: read users from user.json and check credentials
    const filePath = path.join(__dirname, 'user.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Could not read user.json' });
        }
        const users = JSON.parse(data);
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});

// Endpoint to add a new user
app.post('/api/users', (req, res) => {
    const filePath = path.join(__dirname, 'user.json');
    const { email, name } = req.body;
    if (!email || !name) {
        return res.status(400).json({ error: 'Email and name are required' });
    }
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Could not read user.json' });
        }
        let users = [];
        try {
            users = JSON.parse(data);
        } catch (e) {}
        const newUser = {
            id: String(Date.now()),
            email,
            name
        };
        users.push(newUser);
        fs.writeFile(filePath, JSON.stringify(users, null, 2), err => {
            if (err) {
                return res.status(500).json({ error: 'Could not write user.json' });
            }
            res.json(newUser);
        });
    });
});
app.get('/test-post-user', async (req, res) => {
    const testData = {
        email: 'testuser@example.com',
        userAgent: 'test-agent'
    };
    try {
        console.log('Simulating POST /api/user-details with:', testData);
        const { error } = await supabase.from('user_details').insert([
            {
                email: testData.email,
                userAgent: testData.userAgent,
                timestamp: new Date().toISOString()
            }
        ]);
        if (error) {
            console.error('Supabase insertion error:', error);
            return res.status(500).json({ error: error.message });
        }
        sendWelcomeEmail(testData.email);
        res.json({ success: true });
    } catch (err) {
        console.error('Server error during test POST:', err);
        res.status(500).json({ error: err.message });
    }
});

// Configure Google OAuth
passport.use(new GoogleStrategy({
    clientID: '1076361266860-2vq0depuu5ilirdoicofbi04093f7gpo.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    // Save user email to Supabase
    const email = profile.emails[0].value;
    await supabase.from('user_details').insert([
        {
            email,
            userAgent: profile._json['sub'],
            timestamp: new Date().toISOString()
        }
    ]);
    // Send welcome email
    sendWelcomeEmail(email);
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ayomideoluniyi@gmail.com',
        pass: 'taqo ynzu ybmv lhuc' // Gmail App Password
    }
});

function sendWelcomeEmail(email) {
    const mailOptions = {
        from: 'ayomideoluniyi@gmail.com',
        to: email,
        subject: 'Welcome to Lamar Phone and Gadget',
        text: 'Welcome to Lamar Phone and Gadget! Thank you for signing up.'
    };
    console.log('Attempting to send welcome email to:', email);
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            if (error.response) {
                console.error('SMTP response:', error.response);
            }
        } else {
            console.log('Welcome email sent:', info.response);
        }
    });
}
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

// Supabase connection
const SUPABASE_URL = 'https://jlwxkykznyjmstpjcgks.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsd3hreWt6bnlqbXN0cGpjZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTAxNDIsImV4cCI6MjA2OTg4NjE0Mn0.C86cvOOT5QI0PSHlPMujivWV8NLWMtgNiX8KrglzhIQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.post('/api/user-details', async (req, res) => {
    console.log('POST /api/user-details endpoint hit');
    const details = req.body;
    if (!details.email) return res.status(400).json({ error: 'Email required' });
    const filePath = path.join(__dirname, 'user.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        let users = [];
        if (!err && data) {
            try { users = JSON.parse(data); } catch (e) { users = []; }
        }
        users.push({
            ...details,
            timestamp: new Date().toISOString()
        });
        fs.writeFile(filePath, JSON.stringify(users, null, 2), err => {
            if (err) {
                return res.status(500).json({ error: 'Could not save user details' });
            }
            res.json({ success: true });
        });
    });
});

// GET endpoint to get all user details
app.get('/api/user-details', async (req, res) => {
    console.log('GET /api/user-details endpoint hit');
    try {
        const { data, error } = await supabase.from('user_details').select('*').order('timestamp', { ascending: false });
        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: error.message });
        }
        res.json(data);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Google OAuth routes
app.get('/auth/google', (req, res, next) => {
    console.log('GET /auth/google endpoint hit');
    next();
}, passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
}));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    // Successful authentication
    console.log('Google OAuth callback hit. User:', req.user);
        // Redirect to homepage with user_email in query string
        const userEmail = req.user && req.user.emails && req.user.emails[0] ? req.user.emails[0].value : '';
        res.redirect('/?user_email=' + encodeURIComponent(userEmail));
});

const PORT = process.env.PORT || 5000;
try {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
} catch (err) {
    console.error('Server failed to start:', err);
}
