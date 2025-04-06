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
 * node scripts/setup-resend-dns-improved.js
 */

require('dotenv').config({ path: '.env.local' });
const https = require('https');
const querystring = require('querystring');

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
 * First, get the current DNS records to preserve them
 */
async function getCurrentDnsRecords() {
  return new Promise((resolve, reject) => {
    // Base API parameters for getHosts
    const params = {
      ApiUser: API_USER,
      ApiKey: API_KEY,
      UserName: USERNAME,
      ClientIp: CLIENT_IP,
      Command: 'namecheap.domains.dns.getHosts',
      SLD: SLD,
      TLD: TLD
    };

    // Convert parameters to query string
    const queryParams = querystring.stringify(params);

    // API endpoint
    const options = {
      hostname: 'api.namecheap.com',
      path: `/xml.response?${queryParams}`,
      method: 'GET'
    };

    console.log(`Getting current DNS records for ${SLD}.${TLD}...`);

    // Make the request
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('Successfully retrieved current DNS records.');
          // Parse the XML response to extract host records
          // For simplicity, we'll just return the raw XML and parse it later
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
 * Parse the XML response to extract host records
 * This is a simple parser for demonstration purposes
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
 * Sets up DNS records for Resend while preserving existing records
 */
async function setupResendDns() {
  try {
    // Get current DNS records
    const currentRecordsXml = await getCurrentDnsRecords();
    const currentRecords = parseHostRecords(currentRecordsXml);

    console.log(`Found ${currentRecords.length} existing DNS records.`);

    // Combine existing records with Resend records
    // Remove any existing records that would conflict with our new Resend records
    const resendHostNames = RESEND_DNS_RECORDS.map(r => r.HostName);
    const filteredCurrentRecords = currentRecords.filter(record =>
      !resendHostNames.includes(record.HostName) ||
      (record.HostName === resendHostNames && record.RecordType !== 'MX' && record.RecordType !== 'TXT')
    );

    // Combine filtered current records with new Resend records
    const allRecords = [...filteredCurrentRecords, ...RESEND_DNS_RECORDS];

    console.log(`Setting up ${allRecords.length} DNS records (${filteredCurrentRecords.length} existing + ${RESEND_DNS_RECORDS.length} new)...`);

    // Prepare record parameters for setHosts
    const recordParams = {
      ApiUser: API_USER,
      ApiKey: API_KEY,
      UserName: USERNAME,
      ClientIp: CLIENT_IP,
      Command: 'namecheap.domains.dns.setHosts',
      SLD: SLD,
      TLD: TLD
    };

    // Add all records to the parameters
    allRecords.forEach((record, index) => {
      const i = index + 1;
      recordParams[`HostName${i}`] = record.HostName;
      recordParams[`RecordType${i}`] = record.RecordType;
      recordParams[`Address${i}`] = record.Address;
      recordParams[`TTL${i}`] = record.TTL || '1800';

      if (record.RecordType === 'MX' && record.MXPref) {
        recordParams[`MXPref${i}`] = record.MXPref;
      }
    });

    // Convert parameters to query string
    const queryParams = querystring.stringify(recordParams);

    // API endpoint
    const options = {
      hostname: 'api.namecheap.com',
      path: `/xml.response?${queryParams}`,
      method: 'GET'
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

      req.end();
    });
  } catch (error) {
    console.error('Error setting up DNS records:', error.message);
  }
}

// Run the script
setupResendDns();
