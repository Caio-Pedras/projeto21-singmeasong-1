import { prisma } from '../../src/database.js';
import { CreateRecommendationData } from '../../src/services/recommendationsService.js';

export async function createRecommendation(
    recommendationData: CreateRecommendationData
) {
    const recommendations = await prisma.recommendation.create({
        data: recommendationData,
    });

    return recommendations;
}

export async function createRecommendationWithScore(data) {
    const recommendations = await prisma.recommendation.create({
        data,
    });

    return recommendations;
}
