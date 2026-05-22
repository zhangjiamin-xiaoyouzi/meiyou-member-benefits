import { sql } from "drizzle-orm";
import { pgTable, varchar, text, timestamp, boolean, integer, jsonb, index } from "drizzle-orm/pg-core";

// ==================== 系统表（禁止删除） ====================
export const healthCheck = pgTable("health_check", {
  id: integer().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// ==================== 模板管理 ====================
export const templates = pgTable(
  "templates",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 128 }).notNull(),
    level: varchar("level", { length: 1 }).notNull(), // S / A / B
    description: text("description"),
    preview: varchar("preview", { length: 512 }),
    components: jsonb("components").notNull().default(sql`'[]'::jsonb`), // TemplateComponent[]
    is_active: boolean("is_active").default(true).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("templates_level_idx").on(table.level),
    index("templates_is_active_idx").on(table.is_active),
  ]
);

// ==================== 营销策略库 ====================
export const promoPatches = pgTable(
  "promo_patches",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 128 }).notNull(),
    type: varchar("type", { length: 32 }).notNull(), // price_discount / bonus_duration / gift
    config: jsonb("config").notNull().default(sql`'{}'::jsonb`), // PriceDiscountConfig | BonusDurationConfig | GiftConfig
    status: varchar("status", { length: 16 }).notNull().default("active"), // active / inactive
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("promo_patches_type_idx").on(table.type),
    index("promo_patches_status_idx").on(table.status),
  ]
);

// ==================== 活动管理 ====================
export const activities = pgTable(
  "activities",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 128 }).notNull(),
    scene_key: varchar("scene_key", { length: 128 }).notNull().unique(),
    template_id: varchar("template_id", { length: 36 }).notNull().references(() => templates.id),
    template_name: varchar("template_name", { length: 128 }),
    status: varchar("status", { length: 16 }).notNull().default("draft"), // draft / scheduled / active / expired
    time_config: jsonb("time_config").notNull().default(sql`'{}'::jsonb`), // TimeConfig
    audience_rules: jsonb("audience_rules").notNull().default(sql`'[]'::jsonb`), // AudienceRule[]
    shelves: jsonb("shelves").notNull().default(sql`'[]'::jsonb`), // ShelfItem[]
    lottery_config: jsonb("lottery_config").notNull().default(sql`'{}'::jsonb`), // LotteryConfig
    material_config: jsonb("material_config").notNull().default(sql`'{}'::jsonb`), // MaterialConfig
    components: jsonb("components").notNull().default(sql`'{}'::jsonb`), // Record<string, boolean>
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("activities_template_id_idx").on(table.template_id),
    index("activities_status_idx").on(table.status),
    index("activities_scene_key_idx").on(table.scene_key),
    index("activities_created_at_idx").on(table.created_at),
  ]
);
