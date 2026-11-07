import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

import app from '../app.js';
import { connectDB } from '../config/db.js';

let server;
const PORT = 5005;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

const makeRequest = async (url, method = 'GET', body = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  return { status: res.status, data };
};

export const runSystemTests = async () => {
  console.log('========================================================================');
  console.log(' 🧪 RUNNING FOODBRIDGE END-TO-END WORKFLOW INTEGRATION TESTS');
  console.log('========================================================================\n');

  await connectDB();
  server = app.listen(PORT);

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(` ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    const health = await makeRequest(`${BASE_URL}/health`);
    assert(health.status === 200 && health.data.status === 'Healthy', 'Health Check Endpoint responds');

    // 2. Authentication & Roles
    const donorLogin = await makeRequest(`${BASE_URL}/auth/login`, 'POST', {
      email: 'donor@greenplate.com',
      password: 'password123',
    });
    assert(donorLogin.status === 200 && donorLogin.data.user.role === 'donor', 'Donor Login & Role verification');
    const donorToken = donorLogin.data.token;

    const ngoLogin = await makeRequest(`${BASE_URL}/auth/login`, 'POST', {
      email: 'ngo@hopefeed.org',
      password: 'password123',
    });
    assert(ngoLogin.status === 200 && ngoLogin.data.user.role === 'ngo', 'NGO Login & Role verification');
    const ngoToken = ngoLogin.data.token;

    const volunteerLogin = await makeRequest(`${BASE_URL}/auth/login`, 'POST', {
      email: 'volunteer@speedy.com',
      password: 'password123',
    });
    assert(volunteerLogin.status === 200 && volunteerLogin.data.user.role === 'volunteer', 'Volunteer Login');
    const volunteerToken = volunteerLogin.data.token;

    // 3. Security Check: Volunteer cannot create donation
    const invalidCreate = await makeRequest(
      `${BASE_URL}/donations`,
      'POST',
      { title: 'Fake Food', quantity: 10 },
      volunteerToken
    );
    assert(invalidCreate.status === 403, 'Security: Volunteer forbidden from creating donations (Role RBAC)');

    // 4. Donation Creation by Donor
    const newDonation = await makeRequest(
      `${BASE_URL}/donations`,
      'POST',
      {
        title: 'Fresh Paneer Butter Masala & Rotis',
        description: 'Hygienically prepared surplus from wedding reception.',
        category: 'Prepared Meals',
        quantity: 60,
        unit: 'portions',
        storageType: 'Hot Holding',
        collectionDeadline: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
        pickupLocation: {
          address: 'Indiranagar Club Road',
          city: 'Bangalore',
        },
      },
      donorToken
    );
    assert(newDonation.status === 201 && newDonation.data.donation.title.includes('Paneer'), 'Donor creates food listing');
    const donationId = newDonation.data.donation._id;

    // 5. Smart NGO Matching
    const matches = await makeRequest(`${BASE_URL}/donations/${donationId}/recommendations`, 'GET', null, donorToken);
    assert(matches.status === 200 && matches.data.matches.length > 0, 'Smart NGO Matching calculates scores');

    // 6. NGO Claims Donation
    const claimRes = await makeRequest(
      `${BASE_URL}/requests`,
      'POST',
      {
        donationId,
        message: 'Claiming for evening distribution at community center.',
        estimatedBeneficiaries: 60,
        transportMethod: 'Volunteer Courier',
      },
      ngoToken
    );
    assert(claimRes.status === 201 && claimRes.data.request.status === 'pending', 'NGO submits donation claim');
    const requestId = claimRes.data.request._id;

    // 7. Duplicate Claim Prevention
    const duplicateClaim = await makeRequest(
      `${BASE_URL}/requests`,
      'POST',
      {
        donationId,
        message: 'Second duplicate claim.',
        estimatedBeneficiaries: 60,
      },
      ngoToken
    );
    assert(duplicateClaim.status === 400, 'Security: Duplicate claim prevention enforces single request');

    // 8. Donor Accepts Request (Atomic Reservation)
    const acceptRes = await makeRequest(`${BASE_URL}/requests/${requestId}/accept`, 'PUT', { note: 'Approved' }, donorToken);
    assert(acceptRes.status === 200 && acceptRes.data.donation.status === 'Accepted', 'Donor accepts claim (Atomic transition to Accepted)');

    // 9. NGO assigns volunteer
    const deliveriesRes = await makeRequest(`${BASE_URL}/deliveries/ngo-deliveries`, 'GET', null, ngoToken);
    const delivery = deliveriesRes.data.deliveries.find((d) => d.donation._id === donationId);
    assert(!!delivery, 'Delivery record auto-generated on acceptance');

    const assignRes = await makeRequest(
      `${BASE_URL}/deliveries/${delivery._id}/assign-volunteer`,
      'POST',
      { volunteerId: volunteerLogin.data.user._id, instructions: 'Please handle warm food with care' },
      ngoToken
    );
    assert(assignRes.status === 200 && assignRes.data.delivery.status === 'scheduled', 'NGO assigns volunteer courier');

    // 10. Volunteer accepts mission
    const acceptMission = await makeRequest(
      `${BASE_URL}/deliveries/${delivery._id}/respond-assignment`,
      'PUT',
      { action: 'accept' },
      volunteerToken
    );
    assert(acceptMission.status === 200 && acceptMission.data.delivery.status === 'en_route_pickup', 'Volunteer accepts mission and status is en_route_pickup');

    // 11. Handshake Step 1: Donor & Volunteer Pickup Verification (Code verification)
    const verifyPickup = await makeRequest(
      `${BASE_URL}/deliveries/${delivery._id}/verify-pickup`,
      'PUT',
      { code: delivery.pickupVerificationCode, notes: 'Sealed containers verified' },
      volunteerToken
    );
    assert(verifyPickup.status === 200 && verifyPickup.data.delivery.status === 'collected', 'Pickup Handshake verified via code (Status: Collected)');

    // 12. Handshake Step 2: Volunteer & NGO Dropoff Verification
    const verifyDelivery = await makeRequest(
      `${BASE_URL}/deliveries/${delivery._id}/verify-delivery`,
      'PUT',
      { code: delivery.deliveryVerificationCode, notes: 'Meals safely distributed' },
      volunteerToken
    );
    assert(verifyDelivery.status === 200 && verifyDelivery.data.delivery.status === 'delivered', 'Delivery Handshake verified via code (Status: Delivered)');

    // 13. Notifications check
    const notifs = await makeRequest(`${BASE_URL}/notifications`, 'GET', null, donorToken);
    assert(notifs.status === 200 && notifs.data.notifications.length > 0, 'Real-time notifications recorded in user inbox');

    console.log('\n========================================================================');
    console.log(` 🏁 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================================\n');
  } catch (error) {
    console.error('Test execution error:', error);
  } finally {
    server.close();
    process.exit(0);
  }
};

runSystemTests();

