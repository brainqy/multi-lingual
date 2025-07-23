
"use client";

import type { JobOpening, UserProfile } from '@/types';
import { sampleJobOpenings } from './data/jobs';
import { sampleUserProfile } from './data/users';
import { getUserByEmail, createUser } from './data-services/users';

const useMockDb = process.env.USE_MOCK_DB === 'true';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (sampleUserProfile?.tenantId) {
    headers['X-Private-Tenant'] = sampleUserProfile.tenantId;
  }
  return headers;
};


export async function getJobOpenings(): Promise<JobOpening[]> {
  if (useMockDb) {
    console.log('[DataService] DEV MODE: Using sample job openings.');
    await new Promise(resolve => setTimeout(resolve, 500));
    return Promise.resolve([...sampleJobOpenings]);
  }
  
  // The following block will run only if USE_MOCK_DB is not 'true'.
  // It's kept for when you have a live jobs API.
  if (API_BASE_URL) {
    try {
      console.log(`[DataService] Fetching job openings from ${API_BASE_URL}/job-board`);
      const response = await fetch(`${API_BASE_URL}/job-board`, { headers: getHeaders() }); 
      if (!response.ok) {
        console.error(`[DataService] Error fetching job openings: ${response.status} ${response.statusText}`);
        return Promise.resolve([]); // Return empty on API error if not using mock
      }
      const data = await response.json();
      console.log('[DataService] Fetched job openings from API:', data);
      return data as JobOpening[];
    } catch (error) {
      console.error('[DataService] Exception fetching job openings:', error);
      return Promise.resolve([]); // Return empty on exception
    }
  }

  console.warn('[DataService] No API_BASE_URL and mock DB is off. Returning empty job list.');
  return Promise.resolve([]);
}

export async function addJobOpening(
  jobData: Omit<JobOpening, 'id' | 'datePosted' | 'postedByAlumniId' | 'alumniName' | 'tenantId'>,
  currentUser: Pick<UserProfile, 'id' | 'name' | 'tenantId'>
): Promise<JobOpening | null> {
  const newOpeningBase: JobOpening = {
    ...jobData,
    id: `temp-${Date.now()}`,
    datePosted: new Date().toISOString().split('T')[0],
    postedByAlumniId: currentUser.id,
    alumniName: currentUser.name,
    tenantId: currentUser.tenantId,
  };

  if (useMockDb) {
    console.log('[DataService] DEV MODE: Adding job opening to sample data:', newOpeningBase);
    sampleJobOpenings.unshift(newOpeningBase);
    return Promise.resolve(newOpeningBase);
  }

  if (API_BASE_URL) {
    try {
      console.log(`[DataService] Posting job opening to ${API_BASE_URL}/job-board`);
      const response = await fetch(`${API_BASE_URL}/job-board`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(jobData),
      });
      if (!response.ok) {
        console.error(`[DataService] Error posting job opening: ${response.status} ${response.statusText}`);
        return Promise.resolve(null);
      }
      const savedJob = await response.json();
      console.log('[DataService] Job opening posted to API:', savedJob);
      return savedJob as JobOpening;
    } catch (error) {
      console.error('[DataService] Exception posting job opening:', error);
      return Promise.resolve(null);
    }
  }
  
  console.error('[DataService] Cannot add job opening: No API_BASE_URL and mock DB is disabled.');
  return Promise.resolve(null);
}
