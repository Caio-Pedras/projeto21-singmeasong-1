import { prisma } from './../../src/database.js';
import { createRecommendationBody } from './recommendationBodyFactory.js';
import {
    createRecommendation,
    createRecommendationWithScore,
} from './recommendationFactory.js';

export async function deleteAllData() {
    await prisma.$transaction([
        prisma.$executeRaw`TRUNCATE TABLE recommendations RESTART IDENTITY`,
    ]);
}

export async function createScenarioOneRecommendation() {
    const recommendationBody = createRecommendationBody();
    const recommendation = await createRecommendation(recommendationBody);

    return { recommendation };
}

export async function createScenarioOneRecommendationWithNegativeScore() {
    const recommendationBody = createRecommendationBody();
    const recommendation = await createRecommendation(recommendationBody);

    await prisma.recommendation.update({
        where: { id: recommendation.id },
        data: {
            score: { decrement: 5 },
        },
    });

    return { recommendation };
}

export async function createScenarioThreeRecommendation() {
    const recommendations = [];
    for (let i = 0; i < 3; i++) {
        const recommendationBody = createRecommendationBody();
        const recommendation = await createRecommendation(recommendationBody);
        recommendations.push(recommendation);
    }

    return recommendations;
}

export async function createScenarioThreeRecommendationRandomScore() {
    const recommendations = [];
    for (let i = 0; i < 3; i++) {
        const recommendationBody = createRecommendationBody();
        const score = Math.floor(Math.random() * (200 - 10) + 10);
        const recommendation = await createRecommendationWithScore({
            ...recommendationBody,
            score,
        });
        recommendations.push(recommendation);
    }

    return recommendations;
}
