import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  jsonFiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    content: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "createdAt"]),

  generations: defineTable({
    userId: v.id("users"),
    prompt: v.string(),
    result: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("error")),
    error: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
