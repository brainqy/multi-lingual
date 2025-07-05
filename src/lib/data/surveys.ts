
import type { SurveyResponse, SurveyStep } from '@/types';
import { sampleUserProfile } from './users';
import { Genders, DegreePrograms, Industries, AreasOfSupport, TimeCommitments, EngagementModes, SupportTypesSought } from '@/types';
import { graduationYears } from './platform';


export const sampleSurveyResponses: SurveyResponse[] = [
    {
        id: 'resp1',
        userId: 'alumni1',
        userName: 'Alice Wonderland',
        surveyId: 'initialFeedbackSurvey',
        surveyName: 'Initial User Feedback',
        responseDate: new Date(Date.now() - 86400000 * 1).toISOString(),
        data: {
            experience: 'amazing',
            loved_feature: 'Resume Analyzer accuracy',
            referral_likelihood: 'very_likely'
        }
    },
    {
        id: 'resp2',
        userId: 'alumni2',
        userName: 'Bob The Builder',
        surveyId: 'initialFeedbackSurvey',
        surveyName: 'Initial User Feedback',
        responseDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        data: {
            experience: 'okay',
            improvement_suggestion: 'More filter options in Alumni Connect',
            referral_likelihood: 'likely'
        }
    },
    {
        id: 'resp3',
        userId: 'alumni3',
        userName: 'Charlie Brown',
        surveyId: 'initialFeedbackSurvey',
        surveyName: 'Initial User Feedback',
        responseDate: new Date(Date.now() - 86400000 * 3).toISOString(),
        data: {
            experience: 'needs_improvement',
            frustration_details: 'The job board sometimes loads slowly.',
            referral_likelihood: 'neutral'
        }
    },
    {
        id: 'resp_pc_alice',
        userId: 'alumni1',
        userName: 'Alice Wonderland',
        surveyId: 'profileCompletionSurvey',
        surveyName: 'Profile Completion Survey',
        responseDate: new Date(Date.now() - 86400000 * 4).toISOString(),
        data: {
            fullName: 'Alice Wonderland',
            dateOfBirth: '1993-03-15',
            gender: 'Female',
            email: 'alice.wonderland@example.com',
            mobileNumber: '+15551112222',
            currentAddress: '123 Main St, Anytown, CA, USA',
            graduationYear: '2015',
            degreeProgram: 'Master of Science (M.Sc)',
            department: 'Computer Science',
            currentJobTitle: 'Senior Software Engineer',
            currentOrganization: 'Google',
            industry: 'IT/Software',
            workLocation: 'Mountain View, CA',
            linkedInProfile: 'https://linkedin.com/in/alicewonder',
            yearsOfExperience: '7',
            skills: 'Java, Python, Machine Learning, Cloud Computing, Algorithms, React, Next.js',
            areasOfSupport: 'Mentoring Students, Sharing Job Referrals, Guest Lecturing',
            timeCommitment: '1-2 hours',
            preferredEngagementMode: 'Online',
            shareProfileConsent: 'true',
            featureInSpotlightConsent: 'true'
        }
    }
];

export const initialFeedbackSurvey: SurveyStep[] = [
  { id: 'start', type: 'botMessage', text: 'Hi there! 👋 Welcome to JobMatch AI. We\'d love to hear your thoughts.', nextStepId: 'q_experience' },
  { id: 'q_experience', type: 'botMessage', text: 'How has your experience been using our platform so far?', nextStepId: 'ans_experience' },
  { id: 'ans_experience', type: 'userOptions', options: [
    { text: '🚀 Amazing!', value: 'amazing', nextStepId: 'feedback_positive' },
    { text: '😐 It\'s okay', value: 'okay', nextStepId: 'feedback_neutral' },
    { text: '😕 Needs improvement', value: 'needs_improvement', nextStepId: 'feedback_negative' },
  ]},
  { id: 'feedback_positive', type: 'botMessage', text: 'That\'s great to hear! What feature do you find most helpful?', nextStepId: 'input_positive_feature' },
  { id: 'input_positive_feature', type: 'userInput', placeholder: 'Type your favorite feature...', variableName: 'loved_feature', nextStepId: 'q_referral' },
  { id: 'feedback_neutral', type: 'botMessage', text: 'Thanks for the honesty. What\'s one thing we could improve to make it better for you?', nextStepId: 'input_neutral_feedback'},
  { id: 'input_neutral_feedback', type: 'userInput', placeholder: 'Tell us what to improve...', variableName: 'improvement_suggestion', nextStepId: 'q_referral' },
  { id: 'feedback_negative', type: 'botMessage', text: 'We\'re sorry to hear that. Could you please tell us more about what wasn\'t working or what you found frustrating?', nextStepId: 'input_negative_feedback'},
  { id: 'input_negative_feedback', type: 'userInput', placeholder: 'Describe your concerns...', variableName: 'frustration_details', nextStepId: 'q_referral' },
  { id: 'q_referral', type: 'botMessage', text: 'Thank you for sharing! One last thing: how likely are you to recommend JobMatch AI to a friend or colleague?', nextStepId: 'ans_referral_dropdown' },
  { id: 'ans_referral_dropdown', type: 'userDropdown', dropdownOptions: [
      { label: 'Very Likely', value: 'very_likely' },
      { label: 'Likely', value: 'likely' },
      { label: 'Neutral', value: 'neutral' },
      { label: 'Unlikely', value: 'unlikely' },
      { label: 'Very Unlikely', value: 'very_unlikely' },
    ], variableName: 'referral_likelihood', nextStepId: 'thank_you'
  },
  { id: 'thank_you', type: 'botMessage', text: 'Thank you for your valuable feedback! We appreciate you taking the time. Have a great day! 😊', isLastStep: true },
];

export const profileCompletionSurveyDefinition: SurveyStep[] = [
  { id: 'pc_intro', type: 'botMessage', text: "Let's complete your profile! This will help us personalize your experience and connect you with better opportunities.", nextStepId: 'pc_s1_start' },
  { id: 'pc_s1_start', type: 'botMessage', text: "First, some personal details.", nextStepId: 'pc_s1_fullName' },
  { id: 'pc_s1_fullName', type: 'userInput', text: "What's your full name? (Required)", placeholder: "e.g., John Doe", variableName: 'fullName', nextStepId: 'pc_s1_dob' },
  { id: 'pc_s1_dob', type: 'userInput', inputType: 'date', text: "What's your date of birth? (YYYY-MM-DD)", placeholder: "YYYY-MM-DD", variableName: 'dateOfBirth', nextStepId: 'pc_s1_gender' },
  { id: 'pc_s1_gender', type: 'userDropdown', text: "What's your gender?", dropdownOptions: Genders.map(g => ({label: g, value: g})), variableName: 'gender', nextStepId: 'pc_s1_email' },
  { id: 'pc_s1_email', type: 'userInput', inputType: 'email', text: "What's your email ID? (Required)", placeholder: "you@example.com", variableName: 'email', nextStepId: 'pc_s1_mobile' },
  { id: 'pc_s1_mobile', type: 'userInput', inputType: 'tel', text: "What's your mobile number (with country code)?", placeholder: "+1 123 456 7890", variableName: 'mobileNumber', nextStepId: 'pc_s1_address' },
  { id: 'pc_s1_address', type: 'userInput', text: "What's your current address (City, State, Country)?", placeholder: "San Francisco, CA, USA", inputType: 'textarea', variableName: 'currentAddress', nextStepId: 'pc_s2_start' },
  { id: 'pc_s2_start', type: 'botMessage', text: "Great! Now, let's cover your academic background.", nextStepId: 'pc_s2_gradYear' },
  { id: 'pc_s2_gradYear', type: 'userDropdown', text: "What's your year of graduation/batch?", dropdownOptions: graduationYears.map(y => ({label: y, value: y})), variableName: 'graduationYear', nextStepId: 'pc_s2_degree' },
  { id: 'pc_s2_degree', type: 'userDropdown', text: "What's your degree/program?", dropdownOptions: DegreePrograms.map(d => ({label: d, value: d})), variableName: 'degreeProgram', nextStepId: 'pc_s2_department' },
  { id: 'pc_s2_department', type: 'userInput', text: "What's your department?", placeholder: "e.g., Computer Science", variableName: 'department', nextStepId: 'pc_s3_start' },
  { id: 'pc_s3_start', type: 'botMessage', text: "Excellent. Let's move on to your professional information.", nextStepId: 'pc_s3_jobTitle' },
  { id: 'pc_s3_jobTitle', type: 'userInput', text: "What's your current job title?", placeholder: "e.g., Software Engineer", variableName: 'currentJobTitle', nextStepId: 'pc_s3_organization' },
  { id: 'pc_s3_organization', type: 'userInput', text: "What's your current organization?", placeholder: "e.g., Tech Corp", variableName: 'currentOrganization', nextStepId: 'pc_s3_industry' },
  { id: 'pc_s3_industry', type: 'userDropdown', text: "What's your industry/sector?", dropdownOptions: Industries.map(i => ({label: i, value: i})), variableName: 'industry', nextStepId: 'pc_s3_workLocation' },
  { id: 'pc_s3_workLocation', type: 'userInput', text: "What's your work location (City, Country)?", placeholder: "e.g., London, UK", variableName: 'workLocation', nextStepId: 'pc_s3_linkedin' },
  { id: 'pc_s3_linkedin', type: 'userInput', inputType: 'url', text: "What's your LinkedIn profile URL? (Optional)", placeholder: "https://linkedin.com/in/yourprofile", variableName: 'linkedInProfile', nextStepId: 'pc_s3_experience' },
  { id: 'pc_s3_experience', type: 'userInput', text: "How many years of experience do you have?", placeholder: "e.g., 5 or 5+", variableName: 'yearsOfExperience', nextStepId: 'pc_s3_skills_prompt' },
  { id: 'pc_s3_skills_prompt', type: 'botMessage', text: "What are your key skills or areas of expertise? (Please list them, separated by commas)", nextStepId: 'pc_s3_skills_input' },
  { id: 'pc_s3_skills_input', type: 'userInput', placeholder: "e.g., React, Python, Data Analysis", inputType: 'textarea', variableName: 'skills', nextStepId: 'pc_s4_start' },
  { id: 'pc_s4_start', type: 'botMessage', text: "Let's talk about alumni engagement.", nextStepId: 'pc_s4_supportAreas_prompt' },
  { id: 'pc_s4_supportAreas_prompt', type: 'botMessage', text: `Which areas can you support? (Comma-separated from: ${AreasOfSupport.join(', ')})`, nextStepId: 'pc_s4_supportAreas_input' },
  { id: 'pc_s4_supportAreas_input', type: 'userInput', text: "Your areas of support:", placeholder: "e.g., Mentoring Students, Job Referrals", inputType: 'textarea', variableName: 'areasOfSupport', nextStepId: 'pc_s4_timeCommitment' },
  { id: 'pc_s4_timeCommitment', type: 'userDropdown', text: "How much time are you willing to commit per month?", dropdownOptions: TimeCommitments.map(tc => ({label: tc, value: tc})), variableName: 'timeCommitment', nextStepId: 'pc_s4_engagementMode' },
  { id: 'pc_s4_engagementMode', type: 'userDropdown', text: "What's your preferred mode of engagement?", dropdownOptions: EngagementModes.map(em => ({label: em, value: em})), variableName: 'preferredEngagementMode', nextStepId: 'pc_s4_otherComments' },
  { id: 'pc_s4_otherComments', type: 'userInput', text: "Any other comments or notes regarding engagement? (Optional)", inputType: 'textarea', variableName: 'otherComments', nextStepId: 'pc_s5_start' },
  { id: 'pc_s5_start', type: 'botMessage', text: "Now, optionally, tell us if you're looking for any specific support.", nextStepId: 'pc_s5_supportType' },
  { id: 'pc_s5_supportType', type: 'userDropdown', text: "What type of support are you looking for? (Optional)", dropdownOptions: [{label: "Not looking for support now", value: "none"}, ...SupportTypesSought.map(st => ({label: st, value: st}))], variableName: 'lookingForSupportType', nextStepId: 'pc_s5_helpNeeded' },
  { id: 'pc_s5_helpNeeded', type: 'userInput', text: "Briefly describe the help you need. (Optional, if you selected a support type)", inputType: 'textarea', variableName: 'helpNeededDescription', nextStepId: 'pc_s6_start' },
  { id: 'pc_s6_start', type: 'botMessage', text: "Almost done! Just a couple of consent questions.", nextStepId: 'pc_s6_shareProfile' },
  { id: 'pc_s6_shareProfile', type: 'userOptions', text: "Can we share your profile with other alumni for relevant collaboration?", options: [{text: 'Yes', value: 'true', nextStepId: 'pc_s6_featureSpotlight'}, {text: 'No', value: 'false', nextStepId: 'pc_s6_featureSpotlight'}], variableName: 'shareProfileConsent' },
  { id: 'pc_s6_featureSpotlight', type: 'userOptions', text: "Can we feature you on the alumni dashboard or spotlight?", options: [{text: 'Yes', value: 'true', nextStepId: 'pc_end'}, {text: 'No', value: 'false', nextStepId: 'pc_end'}], variableName: 'featureInSpotlightConsent' },
  { id: 'pc_end', type: 'botMessage', text: "Thank you for completing your profile information! Your profile is now more discoverable. 🎉", isLastStep: true },
];

    