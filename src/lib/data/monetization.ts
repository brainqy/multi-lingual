
import type { Wallet, PromoCode, Affiliate, AffiliateClick, AffiliateSignup, ReferralHistoryItem } from '@/types';

const MOCK_USER_ID = 'alumni1';
const MOCK_TENANT_ID = 'Brainqy';

export let sampleWalletBalance: Wallet = {
    tenantId: MOCK_TENANT_ID,
    userId: MOCK_USER_ID,
    coins: 150,
    transactions: [
        { id: 'txn-ref2', tenantId: 'managerUser1', userId: 'managerUser1', date: new Date(Date.now() - 86400000 * 5).toISOString(), description: 'Reward for referral: colleague@example.com', amount: 25, type: 'credit' },
        { id: 'txn1', tenantId: MOCK_TENANT_ID, userId: MOCK_USER_ID, date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), description: 'Reward for profile completion', amount: 50, type: 'credit' },
        { id: 'txn2', tenantId: MOCK_TENANT_ID, userId: MOCK_USER_ID, date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), description: 'Used for premium report', amount: -20, type: 'debit' },
        { id: 'txn3', tenantId: MOCK_TENANT_ID, userId: MOCK_USER_ID, date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), description: 'Appointment booking fee (Bob B.)', amount: -10, type: 'debit' },
        { id: 'txn4', tenantId: MOCK_TENANT_ID, userId: MOCK_USER_ID, date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), description: 'Daily login bonus', amount: 5, type: 'credit' },
    ]
};

export let samplePromoCodes: PromoCode[] = [
  {
    id: 'promo1',
    code: 'WELCOME50',
    description: 'Grants 50 bonus coins for new users.',
    rewardType: 'coins',
    rewardValue: 50,
    expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
    usageLimit: 100,
    timesUsed: 25,
    isActive: true,
  },
  {
    id: 'promo2',
    code: 'XPBOOST',
    description: 'Get an extra 100 XP!',
    rewardType: 'xp',
    rewardValue: 100,
    usageLimit: 0, // Unlimited
    timesUsed: 150,
    isActive: true,
  },
  {
    id: 'promo3',
    code: 'PREMIUMTEST',
    description: '7 days of premium access.',
    rewardType: 'premium_days',
    rewardValue: 7,
    usageLimit: 50,
    timesUsed: 50,
    isActive: true,
  },
   {
    id: 'promo4',
    code: 'OLDCODE',
    description: 'An expired test code.',
    rewardType: 'coins',
    rewardValue: 10,
    expiresAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    usageLimit: 100,
    timesUsed: 10,
    isActive: true,
  },
  {
    id: 'promo5',
    code: 'INACTIVE',
    description: 'A currently inactive code.',
    rewardType: 'coins',
    rewardValue: 20,
    usageLimit: 100,
    timesUsed: 0,
    isActive: false,
  }
];

export const sampleReferralHistory: ReferralHistoryItem[] = [
  { id: 'ref1', referrerUserId: 'alumni1', referredEmailOrName: 'friend1@example.com', referralDate: new Date(Date.now() - 86400000 * 7).toISOString(), status: 'Signed Up' },
  { id: 'ref2', referrerUserId: 'managerUser1', referredEmailOrName: 'colleague@example.com', referralDate: new Date(Date.now() - 86400000 * 5).toISOString(), status: 'Reward Earned', rewardAmount: 25 },
  { id: 'ref3', referrerUserId: 'alumni2', referredEmailOrName: 'contact@example.com', referralDate: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'Pending' },
  { id: 'ref4', referrerUserId: 'alumni2', referredEmailOrName: 'another@example.com', referralDate: new Date(Date.now() - 86400000 * 10).toISOString(), status: 'Expired' },
  { id: 'ref5', referrerUserId: 'managerUser1', referredEmailOrName: 'newcorpcontact@example.com', referralDate: new Date(Date.now() - 86400000 * 1).toISOString(), status: 'Signed Up' },
];

export const sampleAffiliates: Affiliate[] = [
  {
    id: 'affiliateuser1',
    userId: 'alumni1',
    name: 'Alice Wonderland',
    email: 'alice.wonderland@example.com',
    status: 'approved',
    affiliateCode: 'ALICEAFF1',
    commissionRate: 0.15,
    totalEarned: 75.00,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: 'affiliateuser2',
    userId: 'alumni2',
    name: 'Bob The Builder',
    email: 'bob.builder@example.com',
    status: 'pending',
    affiliateCode: 'BOBAFF2',
    commissionRate: 0.12,
    totalEarned: 0,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
   {
    id: 'affiliateuser3',
    userId: 'alumni3',
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    status: 'rejected',
    affiliateCode: 'CHARLIEAFF3',
    commissionRate: 0.10,
    totalEarned: 0,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'affiliateuser4',
    userId: 'managerUser1',
    name: 'Manager Mike',
    email: 'manager.mike@tenant2.com',
    status: 'approved',
    affiliateCode: 'MIKEAFF4',
    commissionRate: 0.20,
    totalEarned: 125.50,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

export const sampleAffiliateClicks: AffiliateClick[] = [
  { id: 'click1', affiliateId: 'affiliateuser4', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), convertedToSignup: true },
  { id: 'click2', affiliateId: 'affiliateuser4', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), convertedToSignup: false },
  { id: 'click3', affiliateId: 'affiliateuser1', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), convertedToSignup: true },
  { id: 'click4', affiliateId: 'affiliateuser4', timestamp: new Date(Date.now() - 0.5 * 86400000).toISOString(), convertedToSignup: false },
  { id: 'click5', affiliateId: 'affiliateuser1', timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), convertedToSignup: false },
  { id: 'click6', affiliateId: 'affiliateuser2', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), convertedToSignup: false },
];

export const sampleAffiliateSignups: AffiliateSignup[] = [
  { id: 'signup1', affiliateId: 'affiliateuser4', newUserId: 'newUserFromMike1', signupDate: new Date(Date.now() - 86400000 * 2).toISOString(), commissionEarned: 7.50 },
  { id: 'signup2', affiliateId: 'affiliateuser1', newUserId: 'newUserFromAlice1', signupDate: new Date(Date.now() - 86400000 * 3).toISOString(), commissionEarned: 5.00 },
  { id: 'signup3', affiliateId: 'affiliateuser4', newUserId: 'newUserFromMike2', signupDate: new Date(Date.now() - 86400000 * 1).toISOString(), commissionEarned: 10.00 },
  { id: 'signup4', affiliateId: 'affiliateuser1', newUserId: 'newUserFromAlice2', signupDate: new Date(Date.now() - 86400000 * 5).toISOString(), commissionEarned: 5.00 },
];
