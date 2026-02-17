import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("jsonFiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("jsonFiles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const file = await ctx.db.get(args.id);
    if (!file || file.userId !== userId) return null;
    return file;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    content: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const now = Date.now();
    return await ctx.db.insert("jsonFiles", {
      userId,
      name: args.name,
      content: args.content,
      description: args.description,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("jsonFiles"),
    name: v.optional(v.string()),
    content: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const file = await ctx.db.get(args.id);
    if (!file || file.userId !== userId) throw new Error("Not found");

    const updates: Partial<{
      name: string;
      content: string;
      description: string;
      updatedAt: number;
    }> = { updatedAt: Date.now() };

    if (args.name !== undefined) updates.name = args.name;
    if (args.content !== undefined) updates.content = args.content;
    if (args.description !== undefined) updates.description = args.description;

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("jsonFiles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const file = await ctx.db.get(args.id);
    if (!file || file.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
