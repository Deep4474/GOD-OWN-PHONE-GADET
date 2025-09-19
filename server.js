// ...existing code...
// ...existing code...
// ...existing code...
// ...existing code...
// ...existing code...
const express = require('express');
const app = express();
// ...existing code...
// Basic Express server to handle user email and send details to Supabase
// Basic Express server to handle user email and send details to Supabase
// Endpoint to log errors from frontend to terminal
app.post('/api/log-error', (req, res) => {
    console.error('Frontend error:', req.body);
    res.json({ success: true });
});
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const nodemailer = require('nodemailer');
// Serve static files from the project directory
app.use(express.static(__dirname));
app.use(session({ secret: 'lamar-secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Test endpoint to simulate POST /api/user-details
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

// ...existing code...

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
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

// Allow only frontend origins for CORS
const allowedOrigins = ['http://127.0.0.1:5501', 'http://localhost:5501'];
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(bodyParser.json());

// Supabase connection
const SUPABASE_URL = 'https://jlwxkykznyjmstpjcgks.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsd3hreWt6bnlqbXN0cGpjZ2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTAxNDIsImV4cCI6MjA2OTg4NjE0Mn0.C86cvOOT5QI0PSHlPMujivWV8NLWMtgNiX8KrglzhIQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.post('/api/user-details', async (req, res) => {
    console.log('POST /api/user-details endpoint hit');
    const { email, userAgent } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    try {
        console.log('Attempting to insert user details into Supabase:', { email, userAgent });
        const { error } = await supabase.from('user_details').insert([
            {
                email,
                userAgent,
                timestamp: new Date().toISOString()
            }
        ]);
        if (error) {
            console.error('Supabase insertion error:', error);
            return res.status(500).json({ error: error.message });
        }
        console.log('User details inserted successfully into Supabase');
        res.json({ success: true });
    } catch (err) {
        console.error('Server error during Supabase insertion:', err);
        res.status(500).json({ error: err.message });
    }
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
