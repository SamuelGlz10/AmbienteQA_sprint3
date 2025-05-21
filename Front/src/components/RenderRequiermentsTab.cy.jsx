import React from "react";
import RenderRequirementsTab from "./RenderRequiermentsTab"; // Import the component
import { mount } from "cypress/react";

const mockProject = {
  EP: [
    { id: "EP1", titulo: "Épica 1", data: "Descripción de la épica 1" },
  ],
};

const mockTasks = {
  EP1: [
    {
      id: "T1",
      title: "Tarea 1",
      description: "Descripción de la tarea 1",
      priority: "alta",
      assignee: "alice@example.com",
    },
  ],
};

const mockTeamMembers = [
  { id: 1, name: "Alice", email: "alice@example.com", role: "Dev" },
  { id: 2, name: "Bob", email: "bob@example.com", role: "QA" },
];

it("Should enter task edit mode, modify a task, save changes, and handle error popup", () => {
  const handleItemClick = cy.stub();
  const handleClosePopup = cy.stub();
  const setTasks = cy.stub();
  const setError = cy.stub();

  cy.mount(
    <RenderRequirementsTab
      project={mockProject}
      activeRequirement="EP"
      setActiveRequirement={cy.stub()}
      handleItemClick={handleItemClick}
      showPopup={true}
      selectedItem={mockProject.EP[0]} // Select "Épica 1"
      handleClosePopup={handleClosePopup}
      tasks={mockTasks}
      setTasks={setTasks}
      teamMembers={mockTeamMembers}
      deleteMode={false}
      setDeleteMode={cy.stub()}
      setTaskToDelete={cy.stub()}
      handleDragStart={cy.stub()}
      handleDragOver={cy.stub()}
      handleDragEnter={cy.stub()}
      handleDragLeave={cy.stub()}
      handleDrop={cy.stub()}
      handleDragEnd={cy.stub()}
      showTaskForm={false}
      setShowTaskForm={cy.stub()}
      taskFormData={{
        title: "",
        description: "",
        priority: "",
        assignee: "",
      }}
      setTaskFormData={cy.stub()}
      setSuccessMessage={cy.stub()}
      setShowDeleteConfirmation={cy.stub()}
      role="admin"
      editing={false} // Start in non-editing mode
      setEditing={cy.stub()}
      saveStatus={{ loading: false, error: null, success: false }}
      requirementEditData={{
        title: "Épica 1",
        description: "Descripción de la épica 1",
      }}
      handleInputChange={cy.stub()}
      handleSaveEdit={cy.stub()}
      nextTaskNumber={3}
      setNextTaskNumber={cy.stub()}
    />
  );

  // Verify the popup is visible
  cy.get(".popup-content").should("be.visible");

  // Enter task edit mode
  cy.get(".edit-team-button").contains("Editar Tareas").click();
  cy.get(".tasks-table").should("exist"); // Ensure the tasks table is visible
  cy.get(".edit-textarea").should("exist"); // Ensure task fields are now editable

  // Modify the first task
  cy.get(".tasks-table tbody tr").first().within(() => {
    cy.get("textarea").first().clear().type("Tarea 1 Modificada");
    cy.get("textarea").last().clear().type("Descripción modificada de la tarea 1");
    cy.get("select").first().select("media"); // Change priority
    cy.get("select").last().select("bob@example.com"); // Change assignee
  });

  // Save the changes
  cy.get(".popup-button.primary").contains("Guardar Tareas").click();
  // Interact with the error popup
  cy.get(".error-popup-content").should("be.visible");
  cy.get(".error-popup-continue").click(); // Close the error popup
  cy.get(".error-popup-content").should("not.exist");
});