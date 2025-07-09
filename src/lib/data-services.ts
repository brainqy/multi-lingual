
"use client";

import type { JobOpening, UserProfile } from '@/types';
import { sampleJobOpenings, sampleUserProfile } from '@/lib/sample-data';

// This constant will be automatically set by Next.js based on the environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Function to get common headers
const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  // Add tenant information if available, as shown in your Postman screenshot
  if (sampleUserProfile?.tenantId) {
    headers['X-Private-Tenant'] = sampleUserProfile.tenantId;
  }
  // If you had auth tokens, they would be added here:
  // const token = localStorage.getItem('authToken');
  // if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};


export async function getJobOpenings(): Promise<JobOpening[]> {
  // If an API base URL is provided, always use it.
  if (API_BASE_URL) {
    try {
      console.log(`[DataService] Fetching job openings from ${API_BASE_URL}/job-board`);
      const response = await fetch(`${API_BASE_URL}/job-board`, { headers: getHeaders() }); 
      if (!response.ok) {
        console.error(`[DataService] Error fetching job openings: ${response.status} ${response.statusText}`);
        // Fallback to sample data on API error
        return Promise.resolve([...sampleJobOpenings]);
      }
      const data = await response.json();
      console.log('[DataService] Fetched job openings from API:', data);
      return data as JobOpening[];
    } catch (error) {
      console.error('[DataService] Exception fetching job openings:', error);
      // Fallback to sample data on exception
      return Promise.resolve([...sampleJobOpenings]);
    }
  }

  // Otherwise (local development without API_BASE_URL set), use sample data.
  console.log('[DataService] DEV MODE: Using sample job openings.');
  await new Promise(resolve => setTimeout(resolve, 500));
  return Promise.resolve([...sampleJobOpenings]); // Return a copy
}

export async function addJobOpening(
  jobData: Omit<JobOpening, 'id' | 'datePosted' | 'postedByAlumniId' | 'alumniName' | 'tenantId'>,
  currentUser: Pick<UserProfile, 'id' | 'name' | 'tenantId'>
): Promise<JobOpening | null> {
  const newOpeningBase: JobOpening = {
    ...jobData,
    id: `temp-${Date.now()}`, // Temporary ID for client-side
    datePosted: new Date().toISOString().split('T')[0],
    postedByAlumniId: currentUser.id,
    alumniName: currentUser.name,
    tenantId: currentUser.tenantId,
  };

  if (API_BASE_URL) {
    try {
      console.log(`[DataService] Posting job opening to ${API_BASE_URL}/job-board`);
      const response = await fetch(`${API_BASE_URL}/job-board`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(jobData), // Send the DTO your backend expects
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

  // Fallback for local development
  console.log('[DataService] DEV MODE: Adding job opening to sample data:', newOpeningBase);
  sampleJobOpenings.unshift(newOpeningBase);
  return Promise.resolve(newOpeningBase);
}
