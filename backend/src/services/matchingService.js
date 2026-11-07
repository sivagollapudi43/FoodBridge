import Organization from '../models/Organization.js';
import User from '../models/User.js';

/**
 * Calculates Haversine distance between two coordinates in kilometers
 */
export const calculateDistanceKm = (lon1, lat1, lon2, lat2) => {
  if (!lon1 || !lat1 || !lon2 || !lat2) return 999;

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};

/**
 * Smart Rule-Based NGO Matching Engine
 * Ranks NGOs for a donation based on distance, category compatibility, capacity, and urgency.
 */
export const matchNGOsForDonation = async (donation) => {
  // Retrieve all active and verified NGOs
  const ngos = await User.find({
    role: 'ngo',
    status: 'active',
  })
    .populate('organization')
    .lean();

  const [donLon, donLat] = donation.location?.coordinates || [77.5946, 12.9716];
  const now = new Date();
  const deadline = new Date(donation.collectionDeadline);
  const hoursUntilDeadline = Math.max(0, (deadline - now) / (1000 * 60 * 60));

  const rankedNGOs = ngos.map((ngo) => {
    let score = 0;
    const breakdown = {
      verification: 0,
      proximity: 0,
      categoryMatch: 0,
      capacityMatch: 0,
      urgencyBonus: 0,
    };

    const org = ngo.organization || {};
    const [ngoLon, ngoLat] = org.location?.coordinates || ngo.location?.coordinates || [77.5946, 12.9716];
    const distanceKm = calculateDistanceKm(donLon, donLat, ngoLon, ngoLat);

    // 1. Verification (20 pts)
    if (ngo.isVerified && org.verificationStatus === 'verified') {
      breakdown.verification = 20;
    } else {
      breakdown.verification = 5; // Unverified penalty
    }

    // 2. Proximity (30 pts max)
    if (distanceKm <= 3) {
      breakdown.proximity = 30;
    } else if (distanceKm <= 7) {
      breakdown.proximity = 25;
    } else if (distanceKm <= 12) {
      breakdown.proximity = 18;
    } else if (distanceKm <= 20) {
      breakdown.proximity = 10;
    } else {
      breakdown.proximity = 3;
    }

    // 3. Category Compatibility (25 pts max)
    const preferred = org.preferredCategories || [];
    if (preferred.length === 0 || preferred.includes(donation.category)) {
      breakdown.categoryMatch = 25;
    } else {
      breakdown.categoryMatch = 10;
    }

    // Cold storage compatibility check
    if (['Refrigerated', 'Frozen'].includes(donation.storageType)) {
      if (org.capacity?.hasColdStorage) {
        breakdown.categoryMatch += 5;
      } else {
        breakdown.categoryMatch -= 5;
      }
    }

    // 4. Capacity Match (15 pts max)
    const orgDailyCapacity = org.capacity?.maxMealsPerDay || 150;
    const estimatedMeals = donation.estimatedMeals || 20;

    if (orgDailyCapacity >= estimatedMeals) {
      breakdown.capacityMatch = 15;
    } else if (orgDailyCapacity >= estimatedMeals * 0.5) {
      breakdown.capacityMatch = 8;
    } else {
      breakdown.capacityMatch = 3;
    }

    // 5. Urgency Handling (10 pts)
    if (hoursUntilDeadline < 4) {
      // Rapid response needed - reward NGOs that have own transport
      if (org.capacity?.hasOwnTransport) {
        breakdown.urgencyBonus = 10;
      } else {
        breakdown.urgencyBonus = 3;
      }
    } else {
      breakdown.urgencyBonus = 8;
    }

    score =
      breakdown.verification +
      breakdown.proximity +
      breakdown.categoryMatch +
      breakdown.capacityMatch +
      breakdown.urgencyBonus;

    return {
      ngoId: ngo._id,
      ngoName: ngo.name,
      organizationName: org.name || ngo.name,
      email: ngo.email,
      phone: ngo.phone,
      isVerified: ngo.isVerified,
      distanceKm,
      hasColdStorage: Boolean(org.capacity?.hasColdStorage),
      hasOwnTransport: Boolean(org.capacity?.hasOwnTransport),
      matchScore: Math.min(100, Math.max(0, score)),
      scoreBreakdown: breakdown,
    };
  });

  // Sort descending by score
  return rankedNGOs.sort((a, b) => b.matchScore - a.matchScore);
};

