import supertest from 'supertest';

import app from '../src/app.js';
import { prisma } from '../src/database.js';
import recommendationFactory from './factories/recommendationFactory.js';

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
});

describe('Recommendation', () => {
    it('given name and youtube link post a recommendation, receive 201', async () => {
        const recommendation = recommendationFactory.createRecommendation();
        const response = await supertest(app)
            .post(`/recommendations/`)
            .send(recommendation);
        expect(response.status).toBe(201);

        const recommendationDb = await prisma.recommendation.findFirst({
            where: { name: recommendation.name },
        });

        expect(recommendationDb.name).toBe(recommendation.name);
    });

    it('given an invalid youtube link do not post a recommendation', async () => {
        const response = await supertest(app)
            .post(`/recommendations/`)
            .send({ name: 'name', youtubeLink: 'invalidurl' });
        expect(response.status).toBe(422);
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});
