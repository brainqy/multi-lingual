
'use server';

import { db } from '@/lib/db';
import type { Appointment } from '@/types';
import { logAction, logError } from '@/lib/logger';

/**
 * Fetches all appointments for a specific user, both as requester and alumni.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of Appointment objects.
 */
export async function getAppointments(userId: string): Promise<Appointment[]> {
  logAction('Fetching appointments', { userId });
  try {
    const appointments = await db.appointment.findMany({
      where: {
        OR: [
          { requesterUserId: userId },
          { alumniUserId: userId },
        ],
      },
      orderBy: {
        dateTime: 'desc',
      },
    });
    return appointments as unknown as Appointment[];
  } catch (error) {
    logError(`[AppointmentAction] Error fetching appointments for user ${userId}`, error, { userId });
    return [];
  }
}

/**
 * Creates a new appointment.
 * @param appointmentData The data for the new appointment.
 * @returns The newly created Appointment object or null if failed.
 */
export async function createAppointment(appointmentData: Omit<Appointment, 'id'>): Promise<Appointment | null> {
  logAction('Creating appointment', { requester: appointmentData.requesterUserId, alumni: appointmentData.alumniUserId });
  try {
    const newAppointment = await db.appointment.create({
      data: {
        ...appointmentData,
        dateTime: new Date(appointmentData.dateTime),
      },
    });
    return newAppointment as unknown as Appointment;
  } catch (error) {
    logError('[AppointmentAction] Error creating appointment', error, { requester: appointmentData.requesterUserId });
    return null;
  }
}


/**
 * Updates an existing appointment.
 * @param appointmentId The ID of the appointment to update.
 * @param updateData The data to update.
 * @returns The updated Appointment object or null if failed.
 */
export async function updateAppointment(appointmentId: string, updateData: Partial<Omit<Appointment, 'id'>>): Promise<Appointment | null> {
  logAction('Updating appointment', { appointmentId, status: updateData.status });
  try {
    const updatedAppointment = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        ...updateData,
        dateTime: updateData.dateTime ? new Date(updateData.dateTime) : undefined,
      },
    });
    return updatedAppointment as unknown as Appointment;
  } catch (error) {
    logError(`[AppointmentAction] Error updating appointment ${appointmentId}`, error, { appointmentId });
    return null;
  }
}
