import React from "react";
import DragAndDropTable from "./DragAndDropTable";

const items = [
  { id: "1", name: "Alice", email: "alice@google.com" },
  { id: "2", name: "Bob", email: "bob@google.com" },
];

describe("<DragAndDropTable />", () => {
  it("Renderiza todo y muestra datos por default", () => {
    cy.mount(
      <DragAndDropTable items={items} listId="available" onDrop={cy.stub()} />
    );
    cy.get(".drag-item").should("have.length", 2);
    cy.mount(
      <DragAndDropTable items={[]} listId="available" onDrop={cy.stub()} />
    );
    cy.contains("No hay miembros disponibles").should("exist");
    cy.mount(
      <DragAndDropTable items={[]} listId="assigned" onDrop={cy.stub()} />
    );
    cy.contains("Arrastra miembros aquí").should("exist");
  });

    it("Se llama el onDrop cuando se suelta algo", () => {
      const onDrop = cy.stub();
      cy.mount(
        <DragAndDropTable items={items} listId="assigned" onDrop={onDrop} />
      );

      const data = {
        ...items[0],
        sourceListId: "available",
      };
      cy.get(".drag-drop-list")
        .trigger("dragover")
        .trigger("drop", {
          dataTransfer: {
            getData: () => JSON.stringify(data),
          },
        });
      cy.wrap(onDrop).should(
        "have.been.calledWith",
        "available",
        "assigned",
        data
      );
    });
});
