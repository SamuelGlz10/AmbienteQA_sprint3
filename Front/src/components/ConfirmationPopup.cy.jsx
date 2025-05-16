import React from 'react';
import ConfirmationPopup from './ConfirmationPopup';

describe('ConfirmationPopup Component', () => {
  const title = 'Confirm Action';
  const message = 'Are you sure you want to proceed?';
  const confirmText = 'Yes';
  const cancelText = 'No';
  let onClose, onConfirm;

  beforeEach(() => {
    onClose = cy.stub().as('onClose');
    onConfirm = cy.stub().as('onConfirm');
    cy.mount(
      <ConfirmationPopup
        isVisible={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title={title}
        message={message}
        confirmText={confirmText}
        cancelText={cancelText}
      />
    );
  });

  it('renders the title and message', () => {
    cy.contains('h3', title).should('be.visible');
    cy.contains('p', message).should('be.visible');
  });

  it('calls onClose when the cancel button is clicked', () => {
    cy.contains('button', cancelText).click().then(() => {
      expect(onClose).to.have.been.called;
    });
  });

  it('calls onConfirm when the confirm button is clicked', () => {
    cy.contains('button', confirmText).click().then(() => {
      expect(onConfirm).to.have.been.called;
    });
  });

  it('closes the popup when Escape key is pressed', () => {
    cy.get('body').trigger('keydown', { key: 'Escape' });
    cy.get('@onClose').should('have.been.called');
  });

  it('confirms the action when Enter key is pressed', () => {
    cy.get('body').trigger('keydown', { key: 'Enter' });
    cy.get('@onConfirm').should('have.been.called');
  });

  it('does not render when isVisible is false', () => {
    cy.mount(
      <ConfirmationPopup
        isVisible={false}
        onClose={onClose}
        onConfirm={onConfirm}
        title={title}
        message={message}
      />
    );
    cy.get('.popup-overlay').should('not.exist');
  });
});
