import React from 'react';
import SuccessPopup from './SuccessPopup';

describe('SuccessPopup Component', () => {
  const message = 'Operation completed successfully!';
  let onClose;

  beforeEach(() => {
    onClose = cy.stub().as('onClose');
    cy.mount(<SuccessPopup message={message} onClose={onClose} />);
  });

  it('renders the success message', () => {
    cy.contains('h3', '¡Éxito!').should('be.visible');
    cy.contains('p', message).should('be.visible');
  });

  it('calls onClose when the continue button is clicked', () => {
    cy.get('.success-popup-continue').click().then(() => {
      expect(onClose).to.have.been.called;
    });
  });

  it('closes the popup when Escape key is pressed', () => {
    cy.get('body').trigger('keydown', { key: 'Escape' });
    cy.get('@onClose').should('have.been.called');
  });

  it('closes the popup when Enter key is pressed', () => {
    cy.get('body').trigger('keydown', { key: 'Enter' });
    cy.get('@onClose').should('have.been.called');
  });

  it('does not render when message is null', () => {
    cy.mount(<SuccessPopup message={null} onClose={onClose} />);
    cy.get('.success-popup-overlay').should('not.exist');
  });
});
