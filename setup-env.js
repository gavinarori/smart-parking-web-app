const fs = require('fs');
const path = require('path');

const envContent = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/smartpark

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Next.js Configuration
NODE_ENV=development

# Optional: If you're using MongoDB Atlas, replace the MONGODB_URI with:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartpark?retryWrites=true&w=majority`;

const envPath = path.join(__dirname, '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Environment file created successfully at .env.local');
  console.log('📝 Please update the MONGODB_URI and JWT_SECRET with your actual values');
} catch (error) {
  console.error('❌ Error creating environment file:', error.message);
  console.log('\n📝 Please create a .env.local file manually with the following content:');
  console.log(envContent);
}
