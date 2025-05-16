import React from "react";
import TopAppBar from "./TopAppBar";
import { MemoryRouter } from "react-router-dom";

describe("<TopAppBar />", () => {
  beforeEach(() => {
    window.localStorage.setItem("token", "test-token");
    window.localStorage.setItem("userId", "test-user");
    window.localStorage.setItem("role", "test-role");
    cy.mount(
      <MemoryRouter initialEntries={["/home"]}>
        <TopAppBar />
      </MemoryRouter>
    );
  });

  it("Cierra sesión correctamente al picar 'Cerrar Sesión'", () => {
    cy.get(".profile-container").click();
    cy.get(".profile-popup").should("be.visible");
    cy.get(".profile-popup-tab").contains("Cerrar Sesión").should("be.visible").click();
    cy.window().then((win) => {
      expect(win.localStorage.getItem("token")).to.be.null;
      expect(win.localStorage.getItem("userId")).to.be.null;
      expect(win.localStorage.getItem("role")).to.be.null;
    });
  });
});
