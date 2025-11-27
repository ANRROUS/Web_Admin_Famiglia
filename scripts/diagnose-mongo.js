const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

async function diagnose() {
    console.log('🔍 Starting MongoDB Connection Diagnosis...');

    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env file not found!');
        return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');

    // Debug: Print keys found
    const keys = envContent.match(/^[\w_]+(?==)/gm);
    console.log('🔑 Keys found in .env:', keys ? keys.join(', ') : 'None');

    const mongoUrlMatch = envContent.match(/^\s*MONGO_URL\s*=\s*(.*)$/m);

    if (!mongoUrlMatch) {
        console.error('❌ MONGO_URL not found in .env file!');
        return;
    }

    let mongoUrl = mongoUrlMatch[1].trim();
    // Remove quotes if present
    if ((mongoUrl.startsWith('"') && mongoUrl.endsWith('"')) || (mongoUrl.startsWith("'") && mongoUrl.endsWith("'"))) {
        mongoUrl = mongoUrl.slice(1, -1);
    }

    const maskedUrl = mongoUrl.replace(/:([^:@]+)@/, ':****@');
    console.log('✅ Found MONGO_URL in .env:', maskedUrl);

    // Check prefix
    if (!mongoUrl.startsWith('mongodb+srv://') && !mongoUrl.startsWith('mongodb://')) {
        console.error('❌ MONGO_URL should start with "mongodb+srv://" or "mongodb://"');
    }

    // Check for unencoded special characters in password
    // Format: mongodb+srv://user:password@host...
    const parts = mongoUrl.split('@');
    if (parts.length > 1) {
        const credentials = parts[0].split('//')[1];
        const [user, password] = credentials.split(':');

        if (password) {
            const specialChars = ['@', ':', '/', '?', '#', '[', ']'];
            const foundSpecial = specialChars.filter(char => password.includes(char));

            if (foundSpecial.length > 0) {
                console.warn('⚠️  WARNING: Password contains special characters that might need encoding:', foundSpecial.join(' '));
                console.warn('   If your password contains these characters, they must be URL encoded.');
                console.warn('   Example: "@" should be "%40", ":" should be "%3A"');
            } else {
                console.log('✅ Password format looks okay (no obvious unencoded special chars).');
            }
        }
    }

    console.log('🔄 Attempting to connect to MongoDB...');

    try {
        await mongoose.connect(mongoUrl, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ Connection SUCCESSFUL!');
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Connection FAILED:', error.message);
        if (error.codeName === 'AtlasError' && error.code === 8000) {
            console.error('   -> This is an AUTHENTICATION error.');
            console.error('   -> Please verify your username and password in .env');
            console.error('   -> Also verify your IP address is whitelisted in MongoDB Atlas Network Access.');
        }
    }
}

diagnose();
