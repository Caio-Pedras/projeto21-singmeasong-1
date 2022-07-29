import { faker } from '@faker-js/faker';

export function createRecommendationBody() {
    const recommendations = {
        name: faker.name.firstName(),
        youtubeLink: `https://www.youtube.com/${faker.random.alpha()}`,
    };

    return recommendations;
}
