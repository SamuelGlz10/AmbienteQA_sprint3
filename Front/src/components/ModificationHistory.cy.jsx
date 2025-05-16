import React from "react";
import ModificationHistory from "./ModificationHistory";
import { MemoryRouter } from "react-router-dom";

describe("<ModificationHistory />", () => {
  beforeEach(() => {
    cy.stub(window, "fetch").resolves({
      ok: true,
      json: () =>
        Promise.resolve({
          modificationHistory: [
            {
              timestamp: new Date().toISOString(),
              userName: "maria",
              userLastname: "castresana",
              userId: "123",
              changes: {
                nombreProyecto: { oldValue: "Viejo", newValue: "Nuevo" },
              },
            },
          ],
        }),
    });
    cy.mount(
      <MemoryRouter>
        <ModificationHistory projectId="fake-id" />
      </MemoryRouter>
    );
  });

  it("Muestra el usuario maria en la modificación", () => {
    cy.contains("Usuario:").should("exist");
    cy.contains("maria castresana").should("exist");
  });
}); 