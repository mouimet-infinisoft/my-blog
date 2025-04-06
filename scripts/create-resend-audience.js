#!/usr/bin/env node

/**
 * This script creates a Resend audience and outputs its ID.
 * 
 * Usage:
 * node scripts/create-resend-audience.js
 */

const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Audience name
const AUDIENCE_NAME = 'Infinisoft Blog Subscribers';

/**
 * Creates a Resend audience
 */
async function createAudience() {
  try {
    console.log(`Creating audience "${AUDIENCE_NAME}"...`);
    
    // Create the audience
    const { data, error } = await resend.audiences.create({
      name: AUDIENCE_NAME,
    });
    
    if (error) {
      console.error('Error creating audience:', error);
      return;
    }
    
    console.log('Audience created successfully!');
    console.log('Audience ID:', data.id);
    console.log('Add this ID to your .env.local file as RESEND_AUDIENCE_ID');
    
    // Update the .env.local file with the audience ID
    const fs = require('fs');
    const envPath = '.env.local';
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('RESEND_AUDIENCE_ID=')) {
      // Update existing audience ID
      const updatedEnvContent = envContent.replace(
        /RESEND_AUDIENCE_ID=.*/,
        `RESEND_AUDIENCE_ID=${data.id}`
      );
      fs.writeFileSync(envPath, updatedEnvContent);
    } else {
      // Add new audience ID
      fs.appendFileSync(envPath, `\nRESEND_AUDIENCE_ID=${data.id}\n`);
    }
    
    console.log('.env.local file updated with the audience ID');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the script
createAudience();
