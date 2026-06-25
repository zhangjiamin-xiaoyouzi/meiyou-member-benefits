import { pgTable, serial, timestamp, index, varchar, jsonb, text, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const activities = pgTable("activities", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	name: varchar({ length: 128 }).notNull(),
	activityKey: varchar("activity_key", { length: 64 }),
	sceneKey: varchar("scene_key", { length: 128 }).default('default'),
	templateId: varchar("template_id", { length: 36 }).notNull(),
	templateName: varchar("template_name", { length: 128 }),
	status: varchar({ length: 16 }).default('draft').notNull(),
	timeConfig: jsonb("time_config").default({}).notNull(),
	lotteryConfig: jsonb("lottery_config").default({}).notNull(),
	materialConfig: jsonb("material_config").default({}).notNull(),
	components: jsonb().default({}).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	audienceGroups: jsonb("audience_groups").default([]),
	category: varchar({ length: 64 }),
	componentConfigs: jsonb("component_configs").default({}),
	createdBy: text("created_by"),
	updatedBy: text("updated_by"),
}, (table) => [
	index("activities_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
]);

export const promoPatches = pgTable("promo_patches", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	name: varchar({ length: 128 }).notNull(),
	type: varchar({ length: 32 }).notNull(),
	config: jsonb().default({}).notNull(),
	status: varchar({ length: 16 }).default('active').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const templates = pgTable("templates", {
	id: varchar({ length: 36 }).default(sql`gen_random_uuid()`).primaryKey().notNull(),
	name: varchar({ length: 128 }).notNull(),
	category: varchar({ length: 64 }).notNull(),
	description: text(),
	preview: varchar({ length: 512 }),
	components: jsonb().default([]).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	createdBy: varchar("created_by", { length: 64 }),
	updatedBy: varchar("updated_by", { length: 64 }),
}, (table) => [
	index("templates_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
]);
