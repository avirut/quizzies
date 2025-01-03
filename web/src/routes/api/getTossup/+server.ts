import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Tossup } from '$lib/types';
import { db } from '$lib/server/db';
import { sql, and, inArray, type SQL } from "drizzle-orm";
import { tossups } from "$lib/server/db/schema";

interface TossupFilters {
    difficulties: number[];
    categories: string[];
}

export const POST: RequestHandler = async ({ request }) => {
    const filters: TossupFilters = await request.json();

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
        return json(null);
    }

    const offset = Math.floor(Math.random() * count);

    const tossup = await db.query.tossups.findFirst({
        where: whereClause,
        offset: offset
    });

    return json(tossup as Tossup);
};