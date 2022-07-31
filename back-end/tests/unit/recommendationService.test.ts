import { faker } from '@faker-js/faker';
import { jest } from '@jest/globals';
import { recommendationRepository } from '../../src/repositories/recommendationRepository';
import { recommendationService } from '../../src/services/recommendationsService';
import { conflictError, notFoundError } from '../../src/utils/errorUtils';

const recommendationData = {
    id: 1,
    name: faker.name.firstName(),
    youtubeLink: `https://www.youtube.com/${faker.random.alpha()}`,
    score: 0,
};

beforeEach(() => {
    jest.clearAllMocks();
});

jest.mock('../../src/repositories/recommendationRepository');

describe('Recommendation test suite', () => {
    it('should create a recommendation', async () => {
        jest.spyOn(
            recommendationRepository,
            'findByName'
        ).mockResolvedValueOnce(undefined);

        jest.spyOn(recommendationRepository, 'create').mockResolvedValueOnce(
            null
        );

        const result = await recommendationService.insert(recommendationData);
        expect(recommendationRepository.findByName).toBeCalledTimes(1);
        expect(recommendationRepository.create).toBeCalledTimes(1);
    });

    it('should not create a recommendation with a not unique name', async () => {
        jest.spyOn(
            recommendationRepository,
            'findByName'
        ).mockResolvedValueOnce(recommendationData);

        expect(
            recommendationService.insert(recommendationData)
        ).rejects.toEqual(
            conflictError('Recommendations names must be unique')
        );
    });
});

describe('Vote test suite', () => {
    describe('Upvote', () => {
        it('should upvote a recommendation', async () => {
            jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(
                recommendationData
            );

            jest.spyOn(
                recommendationRepository,
                'updateScore'
            ).mockResolvedValue(null);

            await recommendationService.upvote(recommendationData.id);
            expect(recommendationRepository.find).toBeCalledTimes(1);
            expect(recommendationRepository.updateScore).toBeCalledTimes(1);
        });

        it('should not upvote a non existing recommendation', async () => {
            jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(
                undefined
            );

            expect(
                recommendationService.upvote(recommendationData.id)
            ).rejects.toEqual(notFoundError());
        });
    });
    describe('Downvote', () => {
        it('should downvote a recommendation', async () => {
            jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(
                recommendationData
            );

            jest.spyOn(
                recommendationRepository,
                'updateScore'
            ).mockImplementationOnce((): any => {
                return recommendationData;
            });

            jest.spyOn(recommendationRepository, 'remove');

            await recommendationService.downvote(recommendationData.id);

            expect(recommendationRepository.find).toBeCalledTimes(1);
            expect(recommendationRepository.updateScore).toBeCalledTimes(1);
        });

        it('should not downvote a non existing recommendation', async () => {
            jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(
                undefined
            );

            expect(
                recommendationService.downvote(recommendationData.id)
            ).rejects.toEqual(notFoundError());
        });

        it('should remove a recommendation when downvoting a recommendation with -5 score', async () => {
            jest.spyOn(recommendationRepository, 'find').mockResolvedValueOnce(
                recommendationData
            );

            jest.spyOn(
                recommendationRepository,
                'updateScore'
            ).mockImplementationOnce((): any => {
                return { ...recommendationData, score: -6 };
            });

            jest.spyOn(
                recommendationRepository,
                'remove'
            ).mockResolvedValueOnce(null);
            await recommendationService.downvote(1);

            expect(recommendationRepository.find).toBeCalledTimes(1);
            expect(recommendationRepository.updateScore).toBeCalledTimes(1);
            expect(recommendationRepository.remove).toBeCalledTimes(1);
        });
    });
});

describe('Getters test suit', () => {
    it('should get all recommendations', async () => {
        const recArr = [recommendationData];
        jest.spyOn(recommendationRepository, 'findAll').mockResolvedValueOnce(
            recArr
        );

        const result = await recommendationService.get();
        expect(recommendationRepository.findAll).toBeCalledTimes(1);
        expect(result).not.toBeNull();
    });

    it('should return the right amount of recommendations', async () => {
        const recArr = new Array(10);
        jest.spyOn(
            recommendationRepository,
            'getAmountByScore'
        ).mockResolvedValueOnce(recArr);
        const result = await recommendationService.getTop(10);
        expect(recommendationRepository.getAmountByScore).toBeCalledTimes(1);
        expect(result).toHaveLength(10);
    });
    describe('Random recommendations', () => {
        const recArr = [
            {
                id: 1,
                name: faker.name.firstName(),
                youtubeLink: `https://www.youtube.com/${faker.random.alpha()}`,
                score: 0,
            },
            {
                id: 2,
                name: faker.name.firstName(),
                youtubeLink: `https://www.youtube.com/${faker.random.alpha()}`,
                score: 20,
            },
        ];

        it('should return a recommendation with score greather than 10', async () => {
            jest.spyOn(Math, 'random').mockImplementation(() => {
                return 0.3;
            });

            jest.spyOn(
                recommendationRepository,
                'findAll'
            ).mockResolvedValueOnce([recArr[0]]);
            const result = await recommendationService.getRandom();
            expect(recommendationRepository.findAll).toBeCalledWith({
                score: 10,
                scoreFilter: 'gt',
            });
            expect(result).not.toBeNull();
        });
        it('should return a recommendation with score lower than 10', async () => {
            jest.spyOn(Math, 'random').mockImplementation(() => {
                return 0.8;
            });

            jest.spyOn(
                recommendationRepository,
                'findAll'
            ).mockResolvedValueOnce([recArr[1]]);
            const result = await recommendationService.getRandom();
            expect(recommendationRepository.findAll).toBeCalledWith({
                score: 10,
                scoreFilter: 'lte',
            });
            expect(result).not.toBeNull();
        });

        it('should throw a not found error', async () => {
            jest.spyOn(recommendationRepository, 'findAll').mockResolvedValue(
                [] as any
            );

            expect(recommendationService.getRandom()).rejects.toEqual(
                notFoundError()
            );
            expect(recommendationRepository.findAll).toBeCalled();
        });
    });
});
