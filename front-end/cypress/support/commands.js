const URL = 'http://localhost:3000';

Cypress.Commands.add('createSong', (name, youtubeLink) => {
    cy.visit(`${URL}/`);
    cy.get('#input_name').type(name);
    cy.get('#input_link').type(youtubeLink);
    cy.intercept('POST', '/recommendations').as('recommendations');
    cy.get('#submit').click();
    cy.wait('@recommendations');
});

Cypress.Commands.add('resetDatabase', () => {
    cy.request('POST', 'http://localhost:5000/test/reset', {});
});
