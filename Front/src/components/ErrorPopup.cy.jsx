import React from 'react';
import ErrorPopup from './ErrorPopup';

describe('ErrorPopup Component', () => {
  const message = 'An error occurred!';
  let onClose;

  beforeEach(() => {
    onClose = cy.stub().as('onClose');
    cy.mount(<ErrorPopup message={message} onClose={onClose} />);
  });

  it('renders the error message', () => {
    cy.contains('h3', '¡Error!').should('be.visible');
    cy.contains('p', message).should('be.visible');
  });

  it('calls onClose when the continue button is clicked', () => {
    cy.get('.error-popup-continue').click().then(() => {
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
    cy.mount(<ErrorPopup message={null} onClose={onClose} />);
    cy.get('.error-popup-overlay').should('not.exist');
  });
});
