
import type { Badge, GamificationRule, DailyChallenge, PromoCode } from '@/types';

export const sampleBadges: Badge[] = [
    { id: 'profile-pro', name: 'Profile Pro', description: 'Completed 100% of your profile.', icon: 'UserCheck', xpReward: 100, triggerCondition: 'Profile completion reaches 100%' },
    { id: 'early-adopter', name: 'Early Adopter', description: 'Joined within the first month of launch.', icon: 'Award', xpReward: 50, triggerCondition: 'User signup date within launch window' },
    { id: 'networker', name: 'Networker', description: 'Made 10+ alumni connections.', icon: 'Users', xpReward: 75, triggerCondition: 'Number of connections > 10' },
    { id: 'analyzer-ace', name: 'Analyzer Ace', description: 'Analyzed 5+ resumes.', icon: 'Zap', xpReward: 50, triggerCondition: 'Resume scan count > 5' },
    { id: 'contributor', name: 'Contributor', description: 'Posted 5+ times in the community feed.', icon: 'MessageSquare', xpReward: 30, triggerCondition: 'Community post count > 5' },
    { id: 'admin-master', name: 'Admin Master', description: 'Successfully managed platform settings.', icon: 'ShieldCheck', xpReward: 0, triggerCondition: 'User role is Admin' },
    { id: 'platform-architect', name: 'Platform Architect', description: 'Made significant contributions to platform architecture.', icon: 'GitFork', xpReward: 200, triggerCondition: 'Admin assigned for specific contributions' }
];

export const sampleXpRules: GamificationRule[] = [
    { actionId: 'profile_complete_50', description: 'Reach 50% Profile Completion', xpPoints: 25 },
    { actionId: 'profile_complete_100', description: 'Reach 100% Profile Completion', xpPoints: 100 },
    { actionId: 'resume_scan', description: 'Analyze a Resume', xpPoints: 20 },
    { actionId: 'book_appointment', description: 'Book an Appointment', xpPoints: 30 },
    { actionId: 'community_post', description: 'Create a Community Post', xpPoints: 15 },
    { actionId: 'community_comment', description: 'Comment on a Post', xpPoints: 5 },
    { actionId: 'successful_referral', description: 'Successful Referral Signup', xpPoints: 50 },
    { actionId: 'daily_login', description: 'Daily Login', xpPoints: 10 },
];

export const sampleChallenges: DailyChallenge[] = [
  {
    id: "flip-challenge-1",
    type: 'flip',
    title: "Platform Power User",
    description: "Complete the following tasks to prove your mastery of the platform and earn a massive XP boost!",
    xpReward: 1000,
    tasks: [
      { description: "Refer 5 colleagues to the platform.", action: "refer", target: 5 },
      { description: "Analyze your resume against 3 different job descriptions.", action: "analyze_resume", target: 3 },
    ]
  },
  {
    id: "challenge-1",
    type: 'standard',
    date: "2023-10-27",
    title: "Reverse a String",
    description: "Write a function that reverses a given string.",
    difficulty: "Easy",
    category: "Coding",
    solution: "A common approach is to use `str.split('').reverse().join('')` in JavaScript, or to use a two-pointer technique swapping characters from the start and end of the string.",
  },
  {
    id: "challenge-2",
    type: 'standard',
    date: "2023-10-28",
    title: "Find the Missing Number",
    description: "Given an array containing n distinct numbers taken from 0, 1, 2, ..., n, find the one that is missing from the array.",
    difficulty: "Medium",
    category: "Coding",
    solution: "Calculate the expected sum of the sequence using the formula n*(n+1)/2. The missing number is the difference between the expected sum and the actual sum of the array elements.",
  },
   {
    id: "flip-challenge-2",
    type: 'flip',
    title: "Interview Champion",
    description: "Hone your interview skills by actively participating in mock interviews.",
    xpReward: 1000,
    tasks: [
      { description: "Attend at least 2 mock interviews as the candidate.", action: "attend_interview", target: 2 },
      { description: "Conduct 1 mock interview as the interviewer.", action: "take_interview", target: 1 },
    ]
  },
  {
    id: "challenge-3",
    type: 'standard',
    date: "2023-10-29",
    title: "Longest Common Subsequence",
    description: "Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.",
    difficulty: "Hard",
    category: "Coding",
    solution: "This is a classic dynamic programming problem. Use a 2D DP table where dp[i][j] is the length of the LCS for the first i characters of text1 and the first j characters of text2.",
  },
  {
    id: "flip-challenge-3",
    type: 'flip',
    title: "Community Builder",
    description: "Help grow our community by posting jobs and referring new members.",
    xpReward: 1000,
    tasks: [
      { description: "Post 2 new, valid job opportunities on the job board.", action: "post_job", target: 2 },
      { description: "Successfully refer 3 new members who sign up.", action: "refer", target: 3 },
    ]
  },
  {
    id: "flip-challenge-4",
    type: 'flip',
    title: "Platform Guru",
    description: "Demonstrate your complete mastery of the ResumeMatch AI ecosystem by completing these advanced tasks.",
    xpReward: 2500,
    tasks: [
      { description: "Analyze a resume, then use Power Edit to apply at least one AI suggestion and re-analyze.", action: "power_edit_resume", target: 1 },
      { description: "Create and save a custom interview quiz with at least 5 questions from the question bank.", action: "create_quiz", target: 1 },
      { description: "Successfully book an appointment with an alumni mentor.", action: "book_appointment", target: 1 }
    ]
  },
  {
    id: "challenge-4",
    type: 'standard',
    date: "2023-10-30",
    title: "Find the Maximum Element in an Array",
    description: "Write a function to find the largest number in a given array of integers.",
    difficulty: "Easy",
    category: "Coding",
    solution: "Initialize a variable with the first element of the array. Iterate through the rest of the array, updating the variable if you find a larger element.",
  },
  {
    id: "challenge-5",
    type: 'standard',
    date: "2023-10-31",
    title: "Reverse a Linked List",
    description: "Reverse a singly linked list. Return the reversed list.",
    difficulty: "Medium",
    category: "Coding",
    solution: "Iterate through the list, keeping track of the previous, current, and next nodes. In each iteration, reverse the 'next' pointer of the current node to point to the previous node.",
  },
];
