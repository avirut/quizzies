import type { PageLoad } from "../$types";
import type { Actions } from "@sveltejs/kit";
import type { Tossup } from '$lib/types.ts';
import { db } from '$lib/server/db';
import { sql } from "drizzle-orm";
import { tossups } from "$lib/server/db/schema";

export const actions = {
	getTossup: async ({ cookies, request }) => {
		// const data = await request.formData();
		// console.log(data);

		const count = await db
			.select({ count: sql<number>`count(*)`.as('count') })
			.from(tossups);
		const offset = Math.floor(Math.random() * count[0].count);
		
		const tossup = await db.query.tossups.findFirst({
			offset: offset
		});

		return (tossup as Tossup);
	}
} satisfies Actions;