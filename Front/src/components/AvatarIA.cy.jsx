import React from "react";
import AvatarIA from "./AvatarIA";
import { MemoryRouter } from "react-router-dom";

describe("<AvatarIA />", () => {
  beforeEach(() => {
    cy.mount(
      <MemoryRouter>
        <AvatarIA />
      </MemoryRouter>
    );
  });

  it("Muestra chat al picarle al boton", () => {
    cy.get(".avatar-ia").click();
    cy.get(".ia-popup-button").eq(1).click(); // Chat button
    cy.get(".chat-container").should("be.visible");
    cy.get(".chat-messages").should("contain", "¿En qué te puedo ayudar?");
  });

  it("Manda un mensaje y se muestra 'cargando'", () => {
    cy.get(".avatar-ia").click();
    cy.get(".ia-popup-button").eq(1).click();
    cy.get(".chat-input").type("Hola IA{enter}");
    cy.get(".chat-message.user-message").should("contain", "Hola IA");
    cy.get(".thinking-message").should("exist");
  });
});
