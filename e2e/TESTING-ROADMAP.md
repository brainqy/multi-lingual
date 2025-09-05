
# E2E Testing Roadmap

This document outlines the strategic roadmap for implementing end-to-end (E2E) tests for the JobMatch AI application using Playwright.

---

### Phase 1: Authentication & Core Navigation (Foundation)

**Objective:** Ensure all public-facing pages and critical authentication flows are working correctly. This is the bedrock of the user experience.

*   **Landing Page (`/landing`):**
    *   [x] Verify the main heading is visible.
    *   [x] Test the primary "Get Started" call-to-action link navigates to the signup page.
*   **Signup Flow (`/auth/signup`):**
    *   [x] Test that a new user can successfully fill out the form, create an account, and be redirected to the dashboard.
*   **Login Flow (`/auth/login`):**
    *   [x] Test that an existing user can log in and be redirected to the dashboard.
*   **Authenticated Navigation:**
    *   [x] Verify a logged-in user can navigate from the dashboard to a core feature page (e.g., Job Tracker).
    *   [x] Handle dynamic elements like the "Daily Streak" popup gracefully.

---

### Phase 2: Core User Feature Interaction

**Objective:** Test the primary functionalities that a standard logged-in user will interact with daily.

*   **Job Tracker (`/job-tracker`):**
    *   [x] **Create Application:** Test opening the "Add Job" dialog, filling it out, and verifying the new job card appears in the 'Saved' column.
    *   [x] **Move Application:** Test dragging a job card from one column (e.g., 'Applied') to another (e.g., 'Interviewing').
    *   [x] **Edit Application:** Test opening an existing job card, editing a field (like 'Notes'), saving, and verifying the change.
    *   [x] **Delete Application:** Test deleting a job card and ensuring it is removed from the board.
*   **Resume Analyzer (`/resume-analyzer`):**
    *   [x] **Submit for Analysis:** Test pasting resume text and a job description, clicking "Analyze", and verifying that the "Analysis Report" section becomes visible.
*   **Alumni Connect (`/alumni-connect`):**
    *   [x] **Search & Filter:** Test typing a name into the search bar and applying a filter (e.g., by company), then verifying that the displayed alumni cards update correctly.
*   **Community Feed (`/community-feed`):**
    *   [x] **Create Post:** Test creating a new text post and verifying it appears at the top of the feed.

---

### Phase 3: AI & Advanced Features

**Objective:** Validate the user flows for key AI-powered tools and more complex user interactions.

*   **AI Mock Interview (`/ai-mock-interview`):**
    *   [ ] Test the setup flow: filling out the topic, number of questions, and starting the session.
    *   [ ] Verify that the user is successfully navigated to the interview interface after setup.
*   **User Profile (`/profile`):**
    *   [x] **Edit and Save:** Test clicking "Edit Profile", changing a field (e.g., 'Bio'), saving the changes, and verifying the updated information is displayed.

---

### Phase 4: Role-Based Access (Admin & Manager)

**Objective:** Ensure that pages and features restricted to specific roles are properly protected.

*   **Admin Access:**
    *   [ ] Create a test that logs in as an `admin` user.
    *   [ ] Verify the user can successfully navigate to `/admin/user-management`.
*   **Manager Access:**
    *   [ ] Create a test that logs in as a `manager` user.
    *   [ ] Verify the user can access their specific management pages (e.g., `/admin/user-management` for their tenant).
*   **Access Denial:**
    *   [ ] Create a test that logs in as a standard `user`.
    *   [ ] Attempt to navigate to an admin-only page (e.g., `/admin/tenants`).
    *   [ ] Verify that an "Access Denied" message is shown or the user is redirected.
