// +page.server.ts
import type { Actions } from "@sveltejs/kit";
import type { Tossup } from '$lib/types';
import { db } from '$lib/server/db';
import { sql, and, inArray, type SQL } from "drizzle-orm";
import { tossups } from "$lib/server/db/schema";

interface TossupFilters {
    difficulties: number[];
    categories: string[];
}

export const actions = {
	getTossup: async ({ request }) => {
		const formData = await request.formData();
		
		// Parse and validate filters with type safety
		const filters: TossupFilters = {
			difficulties: JSON.parse(formData.get('difficulties')?.toString() || '[]'),
			categories: JSON.parse(formData.get('categories')?.toString() || '[]')
		};

		// Build where conditions
		const conditions: SQL[] = [];
		
		if (filters.difficulties.length > 0) {
			conditions.push(inArray(tossups.difficulty, filters.difficulties));
		}
		
		if (filters.categories.length > 0) {
			conditions.push(inArray(tossups.category, filters.categories));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		// Get count of filtered tossups
		const [{ count }] = await db
			.select({ count: sql<number>`count(*)`.as('count') })
			.from(tossups)
			.where(whereClause);

		if (count === 0) {
			return null; // No tossups match the filters
		}

		const offset = Math.floor(Math.random() * count);
		
		const tossup = await db.query.tossups.findFirst({
			where: whereClause,
			offset: offset
		});

		return tossup as Tossup;
	}
} satisfies Actions;