import { expect, describe, it } from 'vitest';
import { match } from '../../../params/integer';

describe('params', () => {
	describe('integer matcher', () => {
		it('should return true for integer value', async () => {
			// act & assert
			expect(match('1')).toBe(true);
			expect(match('11')).toBe(true);
		});

		it('should return false for non-integer value', async () => {
			// act & assert
			expect(match('1s')).toBe(false);
			expect(match('ss')).toBe(false);
			expect(match('s1')).toBe(false);
		});
	});
});
