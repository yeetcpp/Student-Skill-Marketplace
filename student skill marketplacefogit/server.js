import { config } from 'dotenv';
config(); // Load environment variables

import express from 'express';
import passport from 'passport';
import session from 'express-session';
import { createClient } from '@supabase/supabase-js';
import expressLayouts from 'express-ejs-layouts';
import multer from 'multer';

// Log the environment variables to debug
console.log('SUPABASE_URL in server.js:', process.env.SUPABASE_URL);
console.log('SUPABASE_KEY in server.js:', process.env.SUPABASE_KEY);

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and GIF files are allowed'), false);
        }
    }
});

const app = express();

// Middleware setup
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Load Passport configuration
import './passport.js';

// Routes
app.get('/', (req, res) => {
    res.render('index', { user: req.user, title: 'Home', page: 'home' });
});

app.get('/login', (req, res) => {
    res.render('login', { layout: false });
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
        // Check if the user exists in the users table
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('google_id', req.user.google_id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching user after login:', fetchError);
            return res.redirect('/login');
        }

        if (!existingUser) {
            // User doesn't exist, create a new user
            const newUser = {
                google_id: req.user.google_id,
                display_name: req.user.display_name,
                email: req.user.email,
                photo_url: req.user.photo_url
            };

            const { data: createdUser, error: createError } = await supabase
                .from('users')
                .insert([newUser])
                .select()
                .single();

            if (createError) {
                console.error('Error creating user after login:', createError);
                return res.redirect('/login');
            }

            req.user = createdUser;
        }

        if (!req.user.username) {
            res.redirect('/profile/setup');
        } else {
            res.redirect('/profile');
        }
    }
);

app.get('/profile', (req, res) => {
    if (req.isAuthenticated()) {
        console.log('Rendering profile with user:', req.user);
        res.render('profile', { user: req.user, title: 'Profile', page: 'profile' });
    } else {
        res.redirect('/login');
    }
});

app.get('/profile/setup', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('setup', { user: req.user, error: null, title: 'Setup Username', page: 'profile' });
    } else {
        res.redirect('/login');
    }
});

app.post('/profile/setup', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }

    const { username } = req.body;
    const { data, error } = await supabase
        .from('users')
        .update({ username })
        .eq('google_id', req.user.google_id)
        .select()
        .single();

    if (error) {
        console.error('Error updating username:', error);
        return res.render('setup', { user: req.user, error: 'Failed to update username', title: 'Setup Username', page: 'profile' });
    }

    req.user.username = username;
    res.redirect('/profile');
});

app.post('/profile/update-name', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }

    const { display_name } = req.body;
    console.log('Updating display_name for google_id:', req.user.google_id, 'with display_name:', display_name);

    // Update the display name and select the updated row
    const { data, error } = await supabase
        .from('users')
        .update({ display_name })
        .eq('google_id', req.user.google_id)
        .select();

    if (error) {
        console.error('Error updating display name:', error);
        return res.render('profile', { user: req.user, title: 'Profile', page: 'profile', error: 'Failed to update name' });
    }

    if (!data || data.length === 0) {
        console.error('No user found to update display name for google_id:', req.user.google_id);
        return res.render('profile', { user: req.user, title: 'Profile', page: 'profile', error: 'User not found' });
    }

    // Update req.user with the new data from the database
    req.user.display_name = data[0].display_name;
    res.redirect('/profile');
});

app.post('/profile/update-bio', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }

    const { bio } = req.body;
    console.log('Updating bio for google_id:', req.user.google_id, 'with bio:', bio);

    // Update the bio and select the updated row
    const { data, error } = await supabase
        .from('users')
        .update({ bio })
        .eq('google_id', req.user.google_id)
        .select();

    if (error) {
        console.error('Error updating bio:', error);
        return res.render('profile', { user: req.user, title: 'Profile', page: 'profile', error: 'Failed to update bio' });
    }

    if (!data || data.length === 0) {
        console.error('No user found to update bio for google_id:', req.user.google_id);
        return res.render('profile', { user: req.user, title: 'Profile', page: 'profile', error: 'User not found' });
    }

    // Update req.user with the new data from the database
    req.user.bio = data[0].bio;
    res.redirect('/profile');
});

app.post('/profile/update-profile-picture', upload.single('profile_picture'), async (req, res) => {
    if (!req.isAuthenticated()) {
        console.log('User not authenticated, redirecting to /login');
        return res.redirect('/login');
    }

    console.log('Profile picture upload request received');
    console.log('Uploaded file:', req.file);

    if (!req.file) {
        console.log('No file uploaded');
        return res.render('profile', { user: req.user, title: 'Profile', page: 'profile', error: 'No file uploaded' });
    }

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${req.user.google_id}/profile-picture.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true
        });

    if (uploadError) {
        console.error('Error uploading profile picture:', uploadError);
        return res.render('profile', { user: req.user, title: 'Profile', page: 'profile', error: 'Failed to upload profile picture' });
    }

    const { data: publicUrlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

    const photo_url = publicUrlData.publicUrl;
    console.log('Updating photo_url for google_id:', req.user.google_id, 'with photo_url:', photo_url);

    // Update the photo_url and select the updated row
    const { data, error: updateError } = await supabase
        .from('users')
        .update({ photo_url })
        .eq('google_id', req.user.google_id)
        .select();

    if (updateError) {
        console.error('Error updating profile picture URL:', updateError);
        return res.render('profile', { user: req.user, title: 'Profile', page: 'profile', error: 'Failed to update profile picture URL' });
    }

    if (!data || data.length === 0) {
        console.error('No user found to update photo_url for google_id:', req.user.google_id);
        return res.render('profile', { user: req.user, title: 'Profile', page: 'profile', error: 'User not found' });
    }

    // Update req.user with the new data from the database
    req.user.photo_url = data[0].photo_url;
    res.redirect('/profile');
}, (error, req, res, next) => {
    // Handle multer errors
    console.error('Multer error:', error.message);
    res.render('profile', { user: req.user, title: 'Profile', page: 'profile', error: error.message });
});

app.post('/profile/update-cover-photo', upload.single('cover_photo'), async (req, res) => {
    if (!req.isAuthenticated()) {
        console.log('User not authenticated, redirecting to /login');
        return res.redirect('/login');
    }

    console.log('Cover photo upload request received');
    console.log('Uploaded file:', req.file);

    if (!req.file) {
        console.log('No file uploaded');
        return res.render('profile', { user: req.user, title: 'Profile', page: 'profile', error: 'No file uploaded' });
    }

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${req.user.google_id}/cover-photo.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cover-photos')
        .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true
        });

    if (uploadError) {
        console.error('Error uploading cover photo:', uploadError);
        return res.render('profile', { user: req.user, title: "Profile", page: "profile", error: "Failed to upload cover photo" });
    }

    const { data: publicUrlData } = supabase.storage
        .from('cover-photos')
        .getPublicUrl(fileName);

    const cover_photo_url = publicUrlData.publicUrl;
    console.log('Updating cover_photo_url for google_id:', req.user.google_id, 'with cover_photo_url:', cover_photo_url);

    // Update the cover_photo_url and select the updated row
    const { data, error: updateError } = await supabase
        .from('users')
        .update({ cover_photo_url })
        .eq('google_id', req.user.google_id)
        .select();

    if (updateError) {
        console.error('Error updating cover photo URL:', updateError);
        return res.render('profile', { user: req.user, title: 'Profile', page: 'profile', error: 'Failed to update cover photo URL' });
    }

    if (!data || data.length === 0) {
        console.error('No user found to update cover_photo_url for google_id:', req.user.google_id);
        return res.render('profile', { user: req.user, title: 'Profile', page: 'profile', error: 'User not found' });
    }

    // Update req.user with the new data from the database
    req.user.cover_photo_url = data[0].cover_photo_url;
    res.redirect('/profile');
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.redirect('/profile');
        }
        res.redirect('/login');
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});