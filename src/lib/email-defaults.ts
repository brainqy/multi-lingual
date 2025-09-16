
import type { EmailTemplateType } from '@prisma/client';

export const DEFAULT_TEMPLATES: { type: EmailTemplateType; subject: string; body: string }[] = [
  {
    type: 'WELCOME',
    subject: 'Welcome to {{tenantName}}!',
    body: 'Hi {{userName}},\n\nWelcome to the {{tenantName}} alumni network! We are thrilled to have you as part of our community.\n\nYour username is your email: {{userEmail}}\n\nYou can now log in to explore the platform, connect with fellow alumni, find job opportunities, and access career resources.\n\nBest,\nThe {{tenantName}} Team',
  },
  {
    type: 'TENANT_WELCOME',
    subject: 'Your new manager account for {{tenantName}} is ready!',
    body: 'Hi {{userName}},\n\nA new tenant, "{{tenantName}}", has been created on our platform and your account has been set up as the primary manager.\n\nYour username is your email: {{userEmail}}\n\nPlease click the link below to set your password and access your new tenant dashboard:\n\n{{resetLink}}\n\nIf you did not expect this, please contact support.\n\nBest,\nThe Platform Team',
  },
  {
    type: 'APPOINTMENT_CONFIRMATION',
    subject: 'Your appointment is confirmed: {{appointmentTitle}}',
    body: 'Hi {{userName}},\n\nThis is a confirmation that your appointment "{{appointmentTitle}}" with {{partnerName}} has been scheduled for {{appointmentDateTime}}.\n\nYou can view your appointment details here: {{appointmentLink}}\n\nThanks,\nThe {{tenantName}} Team',
  },
  {
    type: 'PASSWORD_RESET',
    subject: 'Reset your password for {{tenantName}}',
    body: 'Hi {{userName}},\n\nA password reset was requested for your account. Please click the link below to set a new password:\n\n{{resetLink}}\n\nIf you did not request this, you can safely ignore this email.\n\nThanks,\nThe {{tenantName}} Team',
  },
  {
    type: 'PRACTICE_INTERVIEW_INVITE',
    subject: 'Invitation to a Practice Interview from {{inviterName}}',
    body: 'Hi {{userName}},\n\n{{inviterName}} has invited you to a practice interview session on the JobMatch AI platform.\n\nClick the link below to join the session when it\'s time:\n\n{{interviewLink}}\n\nThis is a great opportunity to hone your interview skills!\n\nBest,\nThe JobMatch AI Team',
  },
];
