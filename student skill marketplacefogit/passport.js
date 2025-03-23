import { config } from 'dotenv';
config(); // Load environment variables

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { createClient } from '@supabase/supabase-js';

// Log the environment variables to debug
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY);

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('Google profile:', profile);

        // Check if the user already exists in the users table
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('google_id', profile.id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching user from Supabase:', fetchError);
            return done(fetchError);
        }

        if (existingUser) {
            console.log('Existing user found:', existingUser);
            return done(null, existingUser);
        }

        // User doesn't exist, create a new user
        const newUser = {
            google_id: profile.id,
            display_name: profile.displayName,
            email: profile.emails[0].value,
            photo_url: profile.photos[0].value
        };

        console.log('Creating new user:', newUser);

        const { data: createdUser, error: createError } = await supabase
            .from('users')
            .insert([newUser])
            .select()
            .single();

        if (createError) {
            console.error('Error creating user in Supabase:', createError);
            return done(createError);
        }

        console.log('Created user:', createdUser);
        return done(null, createdUser);
    } catch (err) {
        console.error('Error in Google Strategy:', err);
        return done(err);
    }
}));

passport.serializeUser((user, done) => {
    console.log('Serializing user with google_id:', user.google_id);
    done(null, user.google_id);
});

passport.deserializeUser(async (google_id, done) => {
    try {
        console.log('Deserializing user with google_id:', google_id);
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('google_id', google_id)
            .single();

        console.log('Deserialized user from Supabase:', { user, error });

        if (error) {
            return done(error);
        }

        if (!user) {
            return done(new Error('User not found during deserialization'));
        }

        done(null, user);
    } catch (err) {
        done(err);
    }
});

export default passport;

/*import { config } from 'dotenv';
config(); 

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { createClient } from '@supabase/supabase-js';

console.log('Loaded environment variables:', {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    SESSION_SECRET: process.env.SESSION_SECRET
});

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_KEY must be defined in the .env file');
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const initializeGoogleStrategy = () => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be defined in the .env file');
    }

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if the user already exists in the database
            const { data: existingUser, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('google_id', profile.id)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
                console.error('Error fetching user:', fetchError);
                return done(fetchError);
            }

            if (existingUser) {
                console.log('Existing user found:', existingUser);
                return done(null, existingUser);
            }

            // User doesn't exist, create a new user
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert({
                    google_id: profile.id,
                    display_name: profile.displayName,
                    email: profile.emails[0].value,
                    photo_url: profile.photos[0].value,
                    username: profile.emails[0].value.split('@')[0]
                })
                .select()
                .single();

            if (insertError) {
                console.error('Error creating user:', insertError);
                return done(insertError);
            }

            console.log('New user created:', newUser);
            return done(null, newUser);
        } catch (err) {
            console.error('Unexpected error:', err);
            return done(err);
        }
    }));
};

// Initialize the Google Strategy
initializeGoogleStrategy();

passport.serializeUser((user, done) => {
    console.log('Serializing user with google_id:', user.google_id);
    done(null, user.google_id);
});

passport.deserializeUser(async (googleId, done) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('google_id', googleId)
            .single();

        console.log('Deserialized user from Supabase:', { user, error });

        if (error) {
            return done(error);
        }

        done(null, user);
    } catch (err) {
        done(err);
    }
});

*/