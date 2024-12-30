import { sqliteTable, text, integer, real, blob, primaryKey } from 'drizzle-orm/sqlite-core';

export const sets = sqliteTable('sets', {
  id: text('id', { length: 512 }).primaryKey(),
  name: text('name'),
  year: integer('year'),
  difficulty: integer('difficulty'),
  standard: integer('standard', { mode: 'boolean' })
});

export const packets = sqliteTable('packets', {
  id: text('id', { length: 512 }).primaryKey(),
  name: text('name'),
  number: integer('number'),
  setId: text('set', { length: 512 }).references(() => sets.id)
});

export const tossups = sqliteTable('tossups', {
  id: text('id', { length: 512 }).primaryKey(),
  category: text('category'),
  subcategory: text('subcategory'),
  difficulty: integer('difficulty'),

  setId: text('set', { length: 512 }).references(() => sets.id),
  packetId: text('packet', { length: 512 }).references(() => packets.id),
  number: integer('number'),

  // JSON fields with explicit serialization
  question: text('question'),
  wordTiming: text('word_timing'),
  answer: text('answer'),
  powerMark: integer('power_mark'),

  audio: blob('audio', { mode: 'buffer' }),

  qbrCreated: integer('qbr_created', { mode: 'timestamp_ms' }),
  qbrUpdated: integer('qbr_updated', { mode: 'timestamp_ms' }),  
  rerunMarker: integer('rerun_marker')
});