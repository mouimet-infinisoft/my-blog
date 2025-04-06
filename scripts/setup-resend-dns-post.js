#!/usr/bin/env node

/**
 * This script sets up the required DNS records for Resend using the Namecheap API with POST method.
 *
 * Required environment variables:
 * - NAMECHEAP_API_KEY: Your Namecheap API key
 * - NAMECHEAP_USERNAME: Your Namecheap username
 * - NAMECHEAP_CLIENT_IP: Your client IP address
 *
 * Usage:
 * node scripts/setup-resend-dns-post.js
 */

require('dotenv').config({ path: '.env.local' });
const https = require('https');

// Configuration
const API_KEY = process.env.NAMECHEAP_API_KEY || '2793f9b0f1d1405c91e144533789fd7f';
const USERNAME = process.env.NAMECHEAP_USERNAME || 'mouimet-infinisoft';
const CLIENT_IP = process.env.NAMECHEAP_CLIENT_IP || '69.156.159.122';
const DOMAIN = 'infinisoft.world';
const SLD = DOMAIN.split('.')[0]; // 'infinisoft'
const TLD = DOMAIN.split('.')[1]; // 'world'

// Resend DNS records to add
const RESEND_DNS_RECORDS = [
  {
    HostName: 'send.blog',
    RecordType: 'MX',
    Address: 'feedback-smtp.us-east-1.amazonses.com',
    MXPref: '10',
    TTL: '300'
  },
  {
    HostName: 'send.blog',
    RecordType: 'TXT',
    Address: 'v=spf1 include:amazonses.com ~all',
    TTL: '300'
  },
  {
    HostName: 'resend._domainkey.blog',
    RecordType: 'TXT',
    Address: 'k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC4P7/RVudYhCzSX+ECHX4lDOp/GjkJefPBmYlBPbKYLjaCUTftEd0xA2PUUqB8oK/7Yz+z+QRjKHN29ycnd/HEdWDUcGk8+QXM3EjL9RJy5KgxJMJWEA+zdWSKgNFVJYWIJJeJw+66+XJmGR7u+NuLVdgMYc4V0ploOWx5+wK6CQIDAQAB',
    TTL: '300'
  },
  {
    HostName: '_dmarc',
    RecordType: 'TXT',
    Address: 'v=DMARC1; p=none;',
    TTL: '300'
  }
];

/**
 * Sets up DNS records for Resend using POST method
 */
async function setupResendDnsPost() {
  try {
    console.log('Setting up DNS records for Resend using POST method...');

    // Prepare the request body according to the documentation
    const requestValues = [];

    // Add all records to the request values
    RESEND_DNS_RECORDS.forEach((record, index) => {
      const i = index + 1;

      requestValues.push({ Key: `HostName${i}`, Value: record.HostName });
      requestValues.push({ Key: `RecordType${i}`, Value: record.RecordType });
      requestValues.push({ Key: `Address${i}`, Value: record.Address });
      requestValues.push({ Key: `TTL${i}`, Value: record.TTL || '1800' });

      if (record.RecordType === 'MX' && record.MXPref) {
        requestValues.push({ Key: `MXPref${i}`, Value: record.MXPref });
      }
    });

    // Create the request body as URL-encoded form data
    const formData = new URLSearchParams();

    // Add authentication parameters
    formData.append('ApiUser', USERNAME);
    formData.append('ApiKey', API_KEY);
    formData.append('UserName', USERNAME);
    formData.append('ClientIp', CLIENT_IP);
    formData.append('Command', 'namecheap.domains.dns.setHosts');
    formData.append('SLD', SLD);
    formData.append('TLD', TLD);

    // Add all record parameters
    requestValues.forEach(param => {
      formData.append(param.Key, param.Value);
    });

    const requestBody = formData.toString();

    // API endpoint options - using sandbox for testing
    const options = {
      hostname: 'api.sandbox.namecheap.com', // Use sandbox for testing
      path: '/xml.response',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    // Make the request
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('DNS records set successfully!');
            console.log(data);
            resolve(data);
          } else {
            reject(new Error(`API request failed with status code ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      // Write the request body
      req.write(requestBody);
      req.end();
    });
  } catch (error) {
    console.error('Error setting up DNS records:', error.message);
  }
}

// Run the script
setupResendDnsPost();
