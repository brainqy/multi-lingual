
import type { SurveyResponse } from '@/types';
import { sampleUserProfile } from './users';

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
