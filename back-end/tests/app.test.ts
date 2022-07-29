import supertest from 'supertest';

import app from '../src/app.js';
import { prisma } from '../src/database.js';
import { createRecommendationBody } from './factories/recommendationBodyFactory.js';
import {
    createScenarioOneRecommendation,
    createScenarioOneRecommendationWithNegativeScore,
    createScenarioThreeRecommendation,
    createScenarioThreeRecommendationRandomScore,
    deleteAllData,
} from './factories/scenarioFactory.js';

beforeEach(async () => {
    await deleteAllData();
});

describe('Recommendation post', () => {
    it('given name and youtube link post a recommendation, receive 201', async () => {
        const recommendation = createRecommendationBody();
        const response = await supertest(app)
            .post(`/recommendations/`)
            .send(recommendation);
        expect(response.status).toBe(201);
        const recommendationDb = await prisma.recommendation.findFirst({
            where: {
                name: recommendation.name,
                youtubeLink: recommendation.youtubeLink,
            },
        });

        expect(recommendationDb.name).toBe(recommendation.name);
    });

    it('given an invalid youtube link do not post a recommendation, receive 422', async () => {
        const recommendation = createRecommendationBody();
        const response = await supertest(app)
            .post(`/recommendations/`)
            .send({ ...recommendation, youtubeLink: 'invalidurl' });
        expect(response.status).toBe(422);
    });
    it('given an empty name do not post a recommendation, receive 422', async () => {
        const recommendation = createRecommendationBody();
        const response = await supertest(app)
            .post(`/recommendations/`)
            .send({ ...recommendation, name: '' });
        expect(response.status).toBe(422);
    });
});

describe('Recommendation votes', () => {
    it('should upvote a recommendation', async () => {
        const { recommendation } = await createScenarioOneRecommendation();

        const result = await supertest(app).post(
            `/recommendations/${recommendation.id}/upvote`
        );
        expect(result.status).toBe(200);

        const votedRecommendation = await prisma.recommendation.findFirst({
            where: { id: recommendation.id },
        });
        expect(votedRecommendation.score).toBe(1);
    });

    it('should downvote a recommendation', async () => {
        const { recommendation } = await createScenarioOneRecommendation();

        const result = await supertest(app).post(
            `/recommendations/${recommendation.id}/downvote`
        );
        expect(result.status).toBe(200);

        const votedRecommendation = await prisma.recommendation.findFirst({
            where: { id: recommendation.id },
        });
        expect(votedRecommendation.score).toBe(-1);
    });

    it('should remove a recommendation after it get a -6 score', async () => {
        const { recommendation } =
            await createScenarioOneRecommendationWithNegativeScore();

        const result = await supertest(app).post(
            `/recommendations/${recommendation.id}/downvote`
        );
        expect(result.status).toBe(200);

        const votedRecommendation = await prisma.recommendation.findFirst({
            where: { id: recommendation.id },
        });
        expect(votedRecommendation).toBeNull();
    });

    it('should not upvote when giving a non-existent recommendation id, receive 404', async () => {
        const { recommendation } = await createScenarioOneRecommendation();

        const result = await supertest(app).post(
            `/recommendations/${recommendation.id + 1}/upvote`
        );

        expect(result.statusCode).toBe(404);
    });

    it('should not downvote when giving a non-existent recommendation id, receive 404', async () => {
        const { recommendation } = await createScenarioOneRecommendation();

        const result = await supertest(app).post(
            `/recommendations/${recommendation.id + 1}/downvote`
        );

        expect(result.statusCode).toBe(404);
    });
});

describe('Recommendation getters', () => {
    it('should create a scenario with 3 recommendations and get all of them, receive 200', async () => {
        const recommendations = await createScenarioThreeRecommendation();

        const result = await supertest(app).get(`/recommendations`);
        expect(result.status).toBe(200);
        expect(result.body.length).toBe(3);
    });

    it('should create a scenario with 3 recommendations and get each one of them by Id, receive 200', async () => {
        const recommendations = await createScenarioThreeRecommendation();

        const result1 = await supertest(app).get(`/recommendations/1`);
        expect(result1.status).toBe(200);
        expect(result1.body.id).toBe(1);
        const result2 = await supertest(app).get(`/recommendations/2`);
        expect(result2.status).toBe(200);
        expect(result2.body.id).toBe(2);
        const result3 = await supertest(app).get(`/recommendations/3`);
        expect(result3.status).toBe(200);
        expect(result3.body.id).toBe(3);
    });

    it('should not get a recommendation with an inexistent id, receive 404', async () => {
        const recommendations = await createScenarioThreeRecommendation();

        const result1 = await supertest(app).get(`/recommendations/4`);
        expect(result1.status).toBe(404);
    });

    it('should create a scenario with 3 recommendations and get in order of score, receive 200', async () => {
        const recommendations =
            await createScenarioThreeRecommendationRandomScore();

        const result = await supertest(app).get(`/recommendations/top/3`);
        expect(result.status).toBe(200);
        expect(result.body.length).toBe(3);
        expect(result.body[0].score).toBeGreaterThan(result.body[1].score);
        expect(result.body[1].score).toBeGreaterThan(result.body[2].score);
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});
