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
const API_KEY = process.env.NAMECHEAP_API_KEY || 'a25fb5d16c24472fba94097508e82066';
const API_USER = process.env.NAMECHEAP_API_USER || 'infinisoft';
const USERNAME = process.env.NAMECHEAP_USERNAME || 'infinisoft';
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
 * Gets current DNS records
 */
async function getCurrentDnsRecords() {
  try {
    console.log('Getting current DNS records...');

    // Create the request body as URL-encoded form data
    const formData = new URLSearchParams();

    // Add authentication parameters
    formData.append('ApiUser', API_USER);
    formData.append('ApiKey', API_KEY);
    formData.append('UserName', USERNAME);
    formData.append('ClientIp', CLIENT_IP);
    formData.append('Command', 'namecheap.domains.dns.getHosts');
    formData.append('SLD', SLD);
    formData.append('TLD', TLD);

    const requestBody = formData.toString();

    // API endpoint options
    const options = {
      hostname: 'api.namecheap.com',
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
            console.log('Successfully retrieved current DNS records.');
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
    console.error('Error getting DNS records:', error.message);
    throw error;
  }
}

/**
 * Parse the XML response to extract host records
 */
function parseHostRecords(xmlResponse) {
  const hostRecords = [];

  // Very basic XML parsing - in a real application, use a proper XML parser
  const hostLines = xmlResponse.match(/<host[^>]*>([\s\S]*?)<\/host>/g) || [];

  hostLines.forEach(hostLine => {
    const hostName = (hostLine.match(/Name="([^"]*)"/i) || [])[1];
    const recordType = (hostLine.match(/Type="([^"]*)"/i) || [])[1];
    const address = (hostLine.match(/Address="([^"]*)"/i) || [])[1];
    const mxPref = (hostLine.match(/MXPref="([^"]*)"/i) || [])[1];
    const ttl = (hostLine.match(/TTL="([^"]*)"/i) || [])[1];

    if (hostName && recordType && address) {
      const record = {
        HostName: hostName,
        RecordType: recordType,
        Address: address,
        TTL: ttl || '1800'
      };

      if (mxPref) {
        record.MXPref = mxPref;
      }

      hostRecords.push(record);
    }
  });

  return hostRecords;
}

/**
 * Sets up DNS records for Resend using POST method
 */
async function setupResendDnsPost() {
  try {
    console.log('Setting up DNS records for Resend using POST method...');

    // Get current DNS records
    const currentRecordsXml = await getCurrentDnsRecords();
    const currentRecords = parseHostRecords(currentRecordsXml);

    console.log(`Found ${currentRecords.length} existing DNS records.`);

    // Only remove records that would conflict with our new Resend records
    // This preserves all other existing DNS records
    const resendHostNamesAndTypes = RESEND_DNS_RECORDS.map(r => `${r.HostName}-${r.RecordType}`);
    const filteredCurrentRecords = currentRecords.filter(record =>
      !resendHostNamesAndTypes.includes(`${record.HostName}-${record.RecordType}`)
    );

    console.log(`Preserving ${filteredCurrentRecords.length} existing DNS records.`);

    // Combine filtered current records with new Resend records
    const allRecords = [...filteredCurrentRecords, ...RESEND_DNS_RECORDS];

    console.log(`Setting up ${allRecords.length} DNS records (${filteredCurrentRecords.length} existing + ${RESEND_DNS_RECORDS.length} new)...`);

    // Prepare the request body according to the documentation
    const requestValues = [];

    // Add all records to the request values
    allRecords.forEach((record, index) => {
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
    formData.append('ApiUser', API_USER);
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

    // API endpoint options - using production environment
    const options = {
      hostname: 'api.namecheap.com', // Use production environment
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
