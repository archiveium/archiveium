import * as providerRepository from '$lib/server/repositories/providerRepository';
import { RecordNotFoundException } from '../../../exceptions/database';

export async function findAllProviders() {
	return providerRepository.findAllProviders();
}

export async function findProviderById(id: string) {
	try {
		return providerRepository.findProviderById(id);
	} catch (error) {
		throw new RecordNotFoundException(`Email provider ${id} not found`);
	}
}
