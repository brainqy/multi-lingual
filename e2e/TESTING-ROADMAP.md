
# E2E Testing Roadmap

This document outlines the strategic roadmap for implementing end-to-end (E2E) tests for the JobMatch AI application using Playwright.

---

### Phase 1: Authentication & Core Navigation (Complete)

**Objective:** Ensure all public-facing pages and critical authentication flows are working correctly. This is the bedrock of the user experience.

*   [x] **Landing Page (`/landing`):**
    *   [x] Verify the main heading is visible.
    *   [x] Test the primary "Get Started" call-to-action link navigates to the signup page.
*   [x] **Signup Flow (`/auth/signup`):**
    *   [x] Test that a new user can successfully fill out the form, create an account, and be redirected to the dashboard.
*   [x] **Login Flow (`/auth/login`):**
    *   [x] Test that an existing user can log in and be redirected to the dashboard.
*   [x] **Authenticated Navigation:**
    *   [x] Verify a logged-in user can navigate from the dashboard to a core feature page (e.g., Job Tracker).

---

### Phase 2: Core Feature CRUD & Interaction (Complete)

**Objective:** Test the primary functionalities that a standard logged-in user will interact with daily.

*   [x] **Job Tracker (`/job-tracker`):**
    *   [x] **Create Application:** Test opening the "Add Job" dialog, filling it out, and verifying the new job card appears.
    *   [x] **Move Application:** Test dragging a job card from one column to another.
    *   [x] **Edit Application:** Test opening an existing job card, editing a field, and verifying the change.
    *   [x] **Delete Application:** Test deleting a job card and ensuring it is removed.
*   [x] **User Profile (`/profile`):**
    *   [x] **Edit and Save:** Test changing a field, saving, and verifying the updated information is displayed.
*   [x] **Community Feed (`/community-feed`):**
    *   [x] **Create Post:** Test creating a new text post and verifying it appears at the top of the feed.
*   [x] **Alumni Connect (`/alumni-connect`):**
    *   [x] **Search & Filter:** Test applying filters and searching the directory, then verifying results.
*   [x] **Appointments (`/appointments`):**
    *   [x] Test the flow for a user requesting an appointment with an alumnus from the directory.
    *   [x] Verify the user can see their pending and confirmed appointments on the appointments page.
*   [x] **Awards (`/awards`):**
    *   [x] Test the user flow for nominating another user for an active award.

---

### Phase 3: Role-Based Access Control (Admin & Manager) (Complete)

**Objective:** Ensure that pages and features restricted to specific roles are properly protected.

*   [x] **Admin Access:**
    *   [x] Create a test that logs in as an `admin` user and successfully navigates to an admin-only page (e.g., `/admin/tenant-management`).
*   [x] **Manager Access:**
    *   [x] Create a test that logs in as a `manager` user and successfully navigates to a manager-specific page (e.g., `/admin/user-management`).
*   [x] **Access Denial:**
    *   [x] Create a test that logs in as a standard `user` and verifies they are blocked from accessing admin/manager pages.

---

### Phase 4: Advanced User Flows & Edge Cases (In Progress)

**Objective:** Validate more complex, multi-step user interactions.

*   [x] **Wallet & Referrals:**
    *   [x] Test that a user can successfully redeem a valid promo code and see their coin balance update.
    *   [ ] Verify the referral history page displays correctly after a mock referral.
*   [ ] **Settings:**
    *   [ ] Test that a user can change a setting (e.g., a notification preference) and have it persist.
*   [ ] **Multi-Tenancy Isolation:**
    *   [ ] Create users in two different tenants (e.g., `brainqy` and `guruji`).
    *   [ ] Log in as a user from `brainqy` and verify they cannot see alumni or community posts from the `guruji` tenant.

---

### AI Feature E2E Tests (Separate Track)

*   [x] **AI Resume Analyzer (`/resume-analyzer`):** Test submitting a resume and job description and verifying the analysis report appears.
*   [x] **AI Mock Interview (`/ai-mock-interview`):** Test the setup flow and verify the interview interface loads.
