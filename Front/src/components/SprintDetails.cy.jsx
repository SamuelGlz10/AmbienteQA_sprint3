import React from 'react';

import SprintDetails from './SprintDetails';

describe('SprintDetails Component', () => {
  const sprint = {
    number: 1,
    startDate: '2023-01-01',
    endDate: '2023-01-10',
  };
  const tasks = [
    { id: 1, titulo: 'Task 1', descripcion: 'Desc 1', estado: 'Pendiente' },
    { id: 2, titulo: 'Task 2', descripcion: 'Desc 2', estado: 'En progreso' },
    { id: 3, titulo: 'Task 3', descripcion: 'Desc 3', estado: 'Completado' },
  ];

  let setAllTasks, onClose;

  beforeEach(() => {
    setAllTasks = cy.stub().as('setAllTasks');
    onClose = cy.stub().as('onClose');
    cy.mount(
      <SprintDetails
        sprint={sprint}
        sprintTasks={tasks}
        setAllTasks={setAllTasks}
        onClose={onClose}
      />
    );
  });

  it('renders headers and tasks in correct columns', () => {
    cy.contains('h3', 'Pendiente').should('exist');
    cy.contains('h3', 'En Progreso').should('exist');
    cy.contains('h3', 'Completado').should('exist');

    cy.get('.kanban-column').contains('Task 1').scrollIntoView().should('be.visible');
    cy.get('.kanban-column').contains('Task 2').scrollIntoView().should('be.visible');
    cy.get('.kanban-column').contains('Task 3').scrollIntoView().should('be.visible');
  });

  it('displays correct progress percentage', () => {
    cy.get('.progress-text').should('contain', '33%');
  });

  it('calls onClose when close button is clicked', () => {
    cy.get('.close-button').click().then(() => {
      expect(onClose).to.have.been.called;
    });
  });

});
