
'use server';

import { z } from 'zod';
import { createTenantWithAdmin } from './tenants';
import type { TenantSettings } from '@/types';

const requestSchema = z.object({
  tenantName: z.string().min(3),
  tenantDomain: z.string().min(3).regex(/^[a-z0-9-]+$/),
  adminName: z.string().min(2),
  adminEmail: z.string().email(),
});

type RequestFormData = z.infer<typeof requestSchema>;

export async function handleTenantRequest(data: RequestFormData) {
  const validationResult = requestSchema.safeParse(data);
  if (!validationResult.success) {
    return { success: false, error: "Invalid form data provided." };
  }

  const tenantSettings: Omit<TenantSettings, 'id'> = {
    allowPublicSignup: true,
  };
  
  const tenantData = {
    name: data.tenantName,
    domain: data.tenantDomain,
    settings: tenantSettings,
  };

  const adminUserData = {
      name: data.adminName,
      email: data.adminEmail,
  };

  return await createTenantWithAdmin(tenantData, adminUserData);
}
