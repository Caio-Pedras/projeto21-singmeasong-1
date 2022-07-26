/// <reference types="cypress" />

const URL = 'http://localhost:3000';

describe('post a recommendations', () => {
    const recommendations = {
        name: 'Falamansa - Xote dos Milagres',
        youtubeLink: 'https://www.youtube.com/watch?v=chwyjJbcs1Y',
    };

    it('should post a recommendation successfully', () => {
        cy.visit(`${URL}/`);
        cy.get('#name').type(recommendations.name);
        cy.get('#link').type(recommendations.youtubeLink);
        cy.intercept('POST', '/recommendations').as('recommendations');
        cy.get('#submit').click();
        cy.wait('@recommendations');
        cy.url().should('equal', `${URL}/`);
    });
});
