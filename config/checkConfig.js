const checkConfiguration = () => {
    console.log('\n🔧 Checking Configuration...\n');
    
    const requiredEnvVars = [
        'RZR_key_id',
        'RZR_key_secret',
        'JWT_SECRET',
        'DB_URI'
    ];
    
    const missingVars = [];
    const configStatus = {};
    
    requiredEnvVars.forEach(varName => {
        if (!process.env[varName]) {
            missingVars.push(varName);
            configStatus[varName] = '❌ Missing';
        } else {
            configStatus[varName] = '✅ Found';
        }
    });
    
    // Display configuration status
    console.log('Environment Variables:');
    Object.entries(configStatus).forEach(([key, status]) => {
        console.log(`  ${key}: ${status}`);
    });
    
    // Check Razorpay configuration specifically
    if (process.env.RZR_key_id && process.env.RZR_key_secret) {
        console.log('\n💳 Razorpay Configuration:');
        console.log(`  Key ID: ${process.env.RZR_key_id.substr(0, 8)}...`);
        console.log(`  Key Secret: ${'*'.repeat(20)}`);
        console.log('  Status: ✅ Ready');
    } else {
        console.log('\n💳 Razorpay Configuration: ❌ Not configured');
    }
    
    // Display warnings
    if (missingVars.length > 0) {
        console.log('\n⚠️  Warning: Missing environment variables:');
        missingVars.forEach(varName => {
            console.log(`   - ${varName}`);
        });
        console.log('\n   Please add these to your .env file before starting the application.\n');
        
        if (process.env.NODE_ENV === 'production') {
            console.error('❌ Cannot start in production with missing configuration');
            process.exit(1);
        }
    } else {
        console.log('\n✅ All required configuration found!\n');
    }
};

module.exports = checkConfiguration;