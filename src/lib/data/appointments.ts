//create sampleAppointments
import { Appointment } from "@/types";
export let sampleAppointments: Appointment[] = [
  {
      id: "appt1",
      title: "Career Counseling Session",
      dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
      withUser: "careerCounselor1",
      status: "Pending",
      requesterUserId: "alumni1",
      alumniUserId: "alumni1",
      tenantId: ""
  },
  {
      id: "appt2",
      title: "Mock Interview Preparation",
      dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
      withUser: "mockInterviewCoach1",
      status: "Confirmed",
      requesterUserId: "alumni2",
      alumniUserId: "alumni2",
      tenantId: ""
  },
  {
      id: "appt3",
      title: "Resume Review Session",
      dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      withUser: "resumeExpert1",
      status: "Pending",
      requesterUserId: "alumni3",
      alumniUserId: "alumni3",
      tenantId: ""
  }
];