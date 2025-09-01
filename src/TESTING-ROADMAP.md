# Testing Roadmap: Authenticated Pages

This document outlines the strategy for implementing tests for pages and components that require user authentication.

## Phase 1: Foundational Setup & Mocking

**Objective:** Create a reusable and robust setup for simulating authenticated users in our Jest test environment.

1.  **Global `useAuth` Mock:**
    *   **Action:** Create a centralized mock for our `useAuth` hook. This will allow us to easily simulate different authentication states for any test.
    *   **Location:** `src/__mocks__/use-auth.js`
    *   **Details:** The mock will be configurable to return different user objects (e.g., a standard user, a manager, an admin) or a `null` user to test access control.

2.  **Standard Navigation Mock:**
    *   **Action:** Continue to use and refine our mock for `next/navigation`. Most authenticated pages use navigation, so this is a crucial piece.
    *   **Implementation:** Ensure every new test file for an authenticated page includes the `jest.mock('next/navigation', ...)` setup.

## Phase 2: Core User Pages

**Objective:** Ensure that fundamental pages for logged-in users render correctly and handle unauthorized access gracefully.

*   **Target Pages:**
    *   `/dashboard`
    *   `/profile`
    *   `/job-tracker`
    *   `/alumni-connect`
*   **Test Cases for each page:**
    1.  **Render Test (Authenticated):** Verify the page renders its main heading and key components when the `useAuth` mock provides a valid user.
    2.  **Access Test (Unauthenticated):** Verify the page either redirects or displays an "Access Denied" message when the `useAuth` mock provides a `null` user.

## Phase 3: Role-Based Access (Admin & Manager)

**Objective:** Verify that pages restricted to specific roles are accessible to authorized users and blocked for others.

1.  **Enhance `useAuth` Mock:**
    *   **Action:** Update our central `useAuth` mock to easily simulate different user roles (`'user'`, `'manager'`, `'admin'`).

2.  **Target Pages:**
    *   `/admin/dashboard`
    *   `/admin/user-management`
    *   `/admin/tenant-management`
*   **Test Cases for each page:**
    1.  **Admin Access:** Verify the page renders for a user with the `'admin'` role.
    2.  **Manager Access:** Verify the page renders (or is denied, depending on the page logic) for a user with the `'manager'` role.
    3.  **User Access Denial:** Verify a regular `'user'` is shown an "Access Denied" message.

## Phase 4: Testing Data Interactions (Advanced)

**Objective:** Test components that fetch and display data from server actions.

*   **Strategy:**
    *   **Mock Server Actions:** For components that call functions from `src/lib/actions/*`, we will need to mock these server action modules.
    *   **Example:** For the `/job-tracker` page test, we would mock `getUserJobApplications` to return a sample array of job applications. This allows us to test the rendering of the Kanban board without making a real database call.
    *   **Focus:** This will allow us to test loading states, the rendering of lists, and how the UI reacts to different data scenarios (e.g., an empty list vs. a list with items).
