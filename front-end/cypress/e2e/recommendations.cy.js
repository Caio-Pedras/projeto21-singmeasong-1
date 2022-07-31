/// <reference types="cypress" />

const URL = 'http://localhost:3000';

const recommendations = {
    name: 'Até que durou',
    youtubeLink:
        'https://www.youtube.com/watch?v=T3Y6RRSDm4o&ab_channel=CanaldoPeric%C3%A3o',
};

beforeEach(() => {
    cy.resetDatabase();
});

describe('post a recommendations', () => {
    it('should post a recommendation successfully', () => {
        cy.visit(`${URL}/`);
        cy.get('#input_name').type(recommendations.name);
        cy.get('#input_link').type(recommendations.youtubeLink);
        cy.intercept('POST', '/recommendations').as('recommendations');
        cy.get('#submit').click();
        cy.wait('@recommendations');
        cy.url().should('equal', `${URL}/`);
        cy.contains(recommendations.name).should('be.visible');
    });

    it('should not post a recommendation with a name that already exists', () => {
        cy.createSong(recommendations.name, recommendations.youtubeLink);
        cy.on('window:alert', (t) => {
            //assertions
            expect(t).to.contains('Error creating recommendation!');
        });
    });

    it('should not post a recommendation with a invalid link', () => {
        cy.createSong(recommendations.name, 'invalidlink');
        cy.on('window:alert', (t) => {
            //assertions
            expect(t).to.contains('Error creating recommendation!');
        });
    });
});

describe('vote a recommendation on home page', () => {
    it('should upvote a recommendation', () => {
        cy.createSong(recommendations.name, recommendations.youtubeLink);
        cy.visit(`${URL}/`);
        cy.get('#arrow_up').click();
        cy.url().should('equal', `${URL}/`);
        cy.get('#arrow_up').parent().should('have.text', '1');
    });

    it('should downvote a recommendation', () => {
        cy.createSong(recommendations.name, recommendations.youtubeLink);
        cy.visit(`${URL}/`);
        cy.get('#arrow_down').click();
        cy.url().should('equal', `${URL}/`);
        cy.get('#arrow_down').parent().should('have.text', '-1');
    });
});

describe('vote a recommendation on top page', () => {
    it('should upvote a recommendation', () => {
        cy.createSong(recommendations.name, recommendations.youtubeLink);
        cy.visit(`${URL}/top`);
        cy.get('#arrow_up').click();
        cy.url().should('equal', `${URL}/top`);
        cy.get('#arrow_up').parent().should('have.text', '1');
    });

    it('should downvote a recommendation', () => {
        cy.createSong(recommendations.name, recommendations.youtubeLink);
        cy.visit(`${URL}/top`);
        cy.get('#arrow_down').click();
        cy.url().should('equal', `${URL}/top`);
        cy.get('#arrow_down').parent().should('have.text', '-1');
    });
});

describe('vote a recommendation on random page', () => {
    it('should upvote a recommendation', () => {
        cy.createSong(recommendations.name, recommendations.youtubeLink);
        cy.visit(`${URL}/random`);
        cy.get('#arrow_up').click();
        cy.url().should('equal', `${URL}/random`);
        cy.get('#arrow_up').parent().should('have.text', '1');
    });

    it('should downvote a recommendation', () => {
        cy.createSong(recommendations.name, recommendations.youtubeLink);
        cy.visit(`${URL}/random`);
        cy.get('#arrow_down').click();
        cy.url().should('equal', `${URL}/random`);
        cy.get('#arrow_down').parent().should('have.text', '-1');
    });
});
