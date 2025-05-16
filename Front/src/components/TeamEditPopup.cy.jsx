import React from "react";
import TeamEditPopup from "./TeamEditPopup";

const availableMembers = [
  {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    initials: "A",
    role: "Dev",
  },
  {
    id: 2,
    name: "Bobencio",
    email: "bob@example.com",
    initials: "B",
    role: "QA",
  },
  {
    id: 4,
    name: "David",
    email: "david@example.com",
    initials: "D",
    role: "UX",
  },
];
const teamMembers = [
  {
    id: 3,
    name: "Carol",
    email: "carol@example.com",
    initials: "C",
    role: "PM",
  },
];

describe("<TeamEditPopup />", () => {
  beforeEach(() => {
    localStorage.setItem("userId", "3");
  });

  it("Checa si se filtra bien", () => {
    const handleSaveTeam = cy.stub();
    cy.mount(
      <TeamEditPopup
        availableMembers={availableMembers}
        teamMembers={teamMembers}
        handleSaveTeam={handleSaveTeam}
        handleCancelTeam={cy.stub()}
        setError={cy.stub()}
      />
    );

    const data = { ...availableMembers[0], sourceListId: "available" };
    cy.get(".drag-drop-section")
      .first()
      .find(".drag-drop-list")
      .trigger("dragover")
      .trigger("drop", {
        dataTransfer: {
          getData: () => JSON.stringify(data),
        },
      });
    cy.get(".drag-drop-section").first().find(".search-bar").type("Alice");
    cy.get(".drag-drop-section")
      .first()
      .find(".member-card")
      .should("have.length", 1);
    cy.contains("Alice").should("exist");
    cy.contains("Bob").should("not.exist");
    cy.contains("David").should("not.exist");
  });
});
