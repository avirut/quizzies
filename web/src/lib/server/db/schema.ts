import { sqliteTable, text, integer, real, blob, primaryKey } from 'drizzle-orm/sqlite-core';

export const sets = sqliteTable('sets', {
	id: text('id').primaryKey(),
	name: text('name'),
	year: integer('year'),
	standard: integer('standard', { mode: 'boolean' })
});

export const packets = sqliteTable('packets', {
	id: text('id').primaryKey(),
	name: text('name'),
	number: text('number')
});

export const tossups = sqliteTable('tossups', {
	id: text('id').primaryKey(),
	category: text('category'),
	subcategory: text('subcategory'),
	difficulty: integer('difficulty'),

	setId: text('set').references(() => sets.id),
	packetId: text('packet').references(() => packets.id),
	number: integer('number'),

	// Store JSON as text and handle serialization/deserialization in the application
	question: text('question'),
	wordTiming: text('word_timing'),
	answer: text('answer'),
	powerMark: integer('power_mark'),

	audio: blob('audio', { mode: 'buffer' }),

	qbrCreated: integer('qbr_created', { mode: 'timestamp' }),
	qbrUpdated: integer('qbr_updated', { mode: 'timestamp' })
});