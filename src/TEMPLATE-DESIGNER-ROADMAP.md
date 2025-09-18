# Roadmap: Advanced Resume Template Designer

This document outlines the strategic roadmap for developing a full-screen, drag-and-drop resume template editor with detailed styling controls.

---

### Phase 1: Foundational UI & State Management (Target: Q1 2025)

**Objective:** Build the core structure of the editor, establish a robust state management system, and create the basic user interface components.

*   **Full-Screen Editor Layout:**
    *   **Action:** Create a new page at `/admin/template-designer/[templateId]` that serves as a full-screen, distraction-free editor.
    *   **Components:**
        *   A main canvas area for rendering the live resume preview.
        *   A collapsible left sidebar for adding new elements/sections.
        *   A collapsible right sidebar for a "Property Inspector" to edit the styles of the selected element.
        *   A header with save, exit, and preview controls.

*   **State Management Setup:**
    *   **Action:** Integrate a client-side state management library (e.g., Zustand or Jotai) to handle the complex, nested state of the resume object.
    *   **Benefit:** Ensures efficient and predictable updates to the resume data as the user makes changes, preventing unnecessary re-renders of the entire canvas.

*   **Basic Property Inspector:**
    *   **Action:** Develop the initial version of the Property Inspector panel. When a section (e.g., Header, Experience) is clicked on the canvas, this panel will display its basic properties like section title.
    *   **Benefit:** Establishes the core interaction model of "select then edit".

---

### Phase 2: Implementing Drag-and-Drop (Target: Q2 2025)

**Objective:** Enable users to visually reorder the main sections of the resume.

*   **Integrate DnD Library:**
    *   **Action:** Add a proven drag-and-drop library like `dnd-kit`.
    *   **Benefit:** Provides the necessary tools for accessible and performant drag-and-drop functionality.

*   **Section Reordering:**
    *   **Action:** Implement drag-and-drop functionality for the main resume sections (e.g., move the "Education" section above the "Experience" section).
    *   **Interaction:** Users will be able to grab a section handle on the canvas and reorder it visually, with the state updating accordingly.

*   **Entry Reordering (Stretch Goal):**
    *   **Action:** Implement drag-and-drop for individual entries *within* a section (e.g., reordering specific jobs in the Experience section).
    *   **Benefit:** Gives users fine-grained control over the flow and emphasis of their resume content.

---

### Phase 3: Inline Editing & Advanced Styling (Target: Q3 2025)

**Objective:** Allow direct text manipulation on the canvas and introduce detailed styling controls.

*   **Inline Text Editing:**
    *   **Action:** Make all text elements on the canvas (names, job titles, descriptions) directly editable by clicking on them (using `contentEditable` or a similar technique).
    *   **Benefit:** Creates a highly intuitive, WYSIWYG (What You See Is What You Get) editing experience.

*   **Advanced Styling Controls:**
    *   **Action:** Enhance the Property Inspector with more granular styling options for selected elements.
    *   **Controls to Add:**
        *   Font Family selection (from a curated list of web-safe fonts).
        *   Font Size (input or slider).
        *   Font Color (using a color picker component).
        *   Bold, Italic, Underline toggles.
        *   Text Alignment (left, center, right).

---

### Phase 4: Dynamic Structure & Saving (Target: Q4 2025)

**Objective:** Allow users to add new sections, manage columns, and save their creations as custom templates.

*   **Dynamic Section Management:**
    *   **Action:** From the left sidebar, allow users to add new, custom sections to their resume (e.g., "Projects", "Publications", "Volunteer Work").
    *   **Benefit:** Provides maximum flexibility for users with non-traditional career paths.

*   **Column Layouts:**
    *   **Action:** Introduce options to switch between single-column and two-column layouts. Implement drag-and-drop to move sections between columns.
    *   **Benefit:** Unlocks more sophisticated and modern resume designs.

*   **Save as Custom Template:**
    *   **Action:** Implement the logic to save a user's customized layout and styling as a new, private `ResumeTemplate` in the database, associated with their user account or tenant.
    *   **Benefit:** This is the ultimate goal, allowing for a library of user-generated templates.
