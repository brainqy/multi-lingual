import { type DailyChallenge } from "@/types"; // Assuming you have a types file

const sampleChallenges: DailyChallenge[] = [
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
    category: "Strings",
    solution: "",
  },
  {
    id: "challenge-2",
    type: 'standard',
    date: "2023-10-28",
    title: "Find the Missing Number",
    description: "Given an array containing n distinct numbers taken from 0, 1, 2, ..., n, find the one that is missing from the array.",
    difficulty: "Medium",
    category: "Arrays",
    solution: "",
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
    category: "Dynamic Programming",
    solution: "",
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
    id: "challenge-4",
    type: 'standard',
    date: "2023-10-30",
    title: "Find the Maximum Element in an Array",
    description: "Write a function to find the largest number in a given array of integers.",
    difficulty: "Easy",
    category: "Arrays",
    solution: "",
  },
  {
    id: "challenge-5",
    type: 'standard',
    date: "2023-10-31",
    title: "Reverse a Linked List",
    description: "Reverse a singly linked list. Return the reversed list.",
    difficulty: "Medium",
    category: "Linked Lists",
    solution: "",
  },
];

export default sampleChallenges;
