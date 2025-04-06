#!/usr/bin/env node

/**
 * This script sets up the required DNS records for Resend using the Namecheap API.
 *
 * Required environment variables:
 * - NAMECHEAP_API_KEY: Your Namecheap API key
 * - NAMECHEAP_USERNAME: Your Namecheap username
 * - NAMECHEAP_CLIENT_IP: Your client IP address
 *
 * Usage:
 * node scripts/setup-resend-dns.js
 */

require('dotenv').config({ path: '.env.local' });
const https = require('https');
const querystring = require('querystring');

// Configuration
const API_KEY = process.env.NAMECHEAP_API_KEY || '2793f9b0f1d1405c91e144533789fd7f'; // From issue #16
const USERNAME = process.env.NAMECHEAP_USERNAME || 'mouimet-infinisoft'; // Assuming same as GitHub username
const CLIENT_IP = process.env.NAMECHEAP_CLIENT_IP || '127.0.0.1'; // Replace with actual client IP
const DOMAIN = 'infinisoft.world';
const SUBDOMAIN = 'blog';

// Resend DNS records
const DNS_RECORDS = [
  {
    Type: 'MX',
    Host: 'send.blog',
    Address: 'feedback-smtp.us-east-1.amazonses.com',
    MXPref: '10',
    TTL: '300'
  },
  {
    Type: 'TXT',
    Host: 'send.blog',
    Address: 'v=spf1 include:amazonses.com ~all',
    TTL: '300'
  },
  {
    Type: 'TXT',
    Host: 'resend._domainkey.blog',
    Address: 'k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC4P7/RVudYhCzSX+ECHX4lDOp/GjkJefPBmYlBPbKYLjaCUTftEd0xA2PUUqB8oK/7Yz+z+QRjKHN29ycnd/HEdWDUcGk8+QXM3EjL9RJy5KgxJMJWEA+zdWSKgNFVJYWIJJeJw+66+XJmGR7u+NuLVdgMYc4V0ploOWx5+wK6CQIDAQAB',
    TTL: '300'
  },
  {
    Type: 'TXT',
    Host: '_dmarc',
    Address: 'v=DMARC1; p=none;',
    TTL: '300'
  }
];

/**
 * Makes a request to the Namecheap API
 * @param {Object} params - API parameters
 * @returns {Promise<Object>} - API response
 */
function makeApiRequest(params) {
  return new Promise((resolve, reject) => {
    // Base API parameters
    const baseParams = {
      ApiUser: USERNAME,
      ApiKey: API_KEY,
      UserName: USERNAME,
      ClientIp: CLIENT_IP,
      Command: 'namecheap.domains.dns.setHosts',
      SLD: DOMAIN.split('.')[0],
      TLD: DOMAIN.split('.')[1]
    };

    // Combine base parameters with provided parameters
    const requestParams = { ...baseParams, ...params };

    // Convert parameters to query string
    const queryParams = querystring.stringify(requestParams);

    // API endpoint
    const options = {
      hostname: 'api.namecheap.com',
      path: `/xml.response?${queryParams}`,
      method: 'GET'
    };

    // Make the request
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`API request failed with status code ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * Sets up DNS records for Resend
 */
async function setupResendDns() {
  try {
    console.log('Setting up DNS records for Resend...');

    // Prepare record parameters
    const recordParams = {};

    DNS_RECORDS.forEach((record, index) => {
      recordParams[`HostName${index + 1}`] = record.Host;
      recordParams[`RecordType${index + 1}`] = record.Type;
      recordParams[`Address${index + 1}`] = record.Address;
      recordParams[`TTL${index + 1}`] = record.TTL;

      if (record.Type === 'MX') {
        recordParams[`MXPref${index + 1}`] = record.MXPref;
      }
    });

    // Make API request to set DNS records
    const response = await makeApiRequest(recordParams);

    console.log('DNS records set successfully!');
    console.log(response);
  } catch (error) {
    console.error('Error setting up DNS records:', error.message);
  }
}

// Run the script
setupResendDns();
