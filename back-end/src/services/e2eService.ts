import { recommendationRepository } from '../repositories/recommendationRepository';

async function deleteAll() {
    await recommendationRepository.deleteAll();
}

export const e2eService = {
    deleteAll,
};
