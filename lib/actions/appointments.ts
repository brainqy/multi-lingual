
'use server';

import { db } from '@/lib/db';
import type { Appointment } from '@/types';
import { logAction, logError } from '@/lib/logger';
import { createNotification } from './notifications';
import { getDashboardData } from './dashboard';

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
    const dashboardData = await getDashboardData();
    const requesterUser = dashboardData.users.find(u => u.id === appointmentData.requesterUserId);

    if (!requesterUser) {
        throw new Error(`Requester user with ID ${appointmentData.requesterUserId} not found.`);
    }

    const newAppointment = await db.appointment.create({
      data: {
        ...appointmentData,
        dateTime: new Date(appointmentData.dateTime),
      },
    });

    // Notify the user being invited
    await createNotification({
        userId: newAppointment.alumniUserId,
        type: 'event',
        content: `You have a new appointment request from ${requesterUser.name} for "${newAppointment.title}".`,
        link: '/appointments',
        isRead: false,
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

    // Send notifications based on status change
    if (updateData.status === 'Confirmed') {
        await createNotification({
            userId: updatedAppointment.requesterUserId,
            type: 'event',
            content: `Your appointment with ${updatedAppointment.withUser} for "${updatedAppointment.title}" has been confirmed.`,
            link: '/appointments',
            isRead: false,
        });
    } else if (updateData.status === 'Cancelled') {
        const userToNotify = updatedAppointment.requesterUserId; // Assuming the one who didn't cancel gets notified
        await createNotification({
            userId: userToNotify,
            type: 'system',
            content: `Your appointment with ${updatedAppointment.withUser} for "${updatedAppointment.title}" has been cancelled.`,
            link: '/appointments',
            isRead: false,
        });
    }

    return updatedAppointment as unknown as Appointment;
  } catch (error) {
    logError(`[AppointmentAction] Error updating appointment ${appointmentId}`, error, { appointmentId });
    return null;
  }
}

/**
 * Reassigns an appointment to a new alumni expert.
 * @param appointmentId The ID of the appointment to reassign.
 * @param newAlumniUserId The ID of the new alumni expert.
 * @param reason Optional reason for reassignment.
 * @returns An object indicating success and the updated appointment or an error message.
 */
export async function reassignAppointment(appointmentId: string, newAlumniUserId: string, reason?: string): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    logAction('Reassigning appointment', { appointmentId, newAlumniUserId });
    try {
        const appointment = await db.appointment.findUnique({ where: { id: appointmentId } });
        if (!appointment) {
            return { success: false, error: 'Appointment not found.' };
        }

        const newAlumni = await db.user.findUnique({ where: { id: newAlumniUserId }});
        if (!newAlumni) {
            return { success: false, error: 'New expert not found.' };
        }

        const updatedAppointment = await db.appointment.update({
            where: { id: appointmentId },
            data: {
                alumniUserId: newAlumniUserId,
                withUser: newAlumni.name,
                notes: `Reassigned. Reason: ${reason || 'N/A'}. Original note: ${appointment.notes}`,
            },
        });

        // Notify the new expert
        await createNotification({
            userId: newAlumniUserId,
            type: 'event',
            content: `An appointment request for "${updatedAppointment.title}" has been reassigned to you.`,
            link: '/appointments',
            isRead: false,
        });

        return { success: true, appointment: updatedAppointment as unknown as Appointment };
    } catch (error) {
        logError(`[AppointmentAction] Error reassigning appointment ${appointmentId}`, error, { appointmentId });
        return { success: false, error: 'An unexpected error occurred during reassignment.' };
    }
}

