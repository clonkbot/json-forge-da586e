import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("generations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);
  },
});

export const create = mutation({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("generations", {
      userId,
      prompt: args.prompt,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const complete = mutation({
  args: {
    id: v.id("generations"),
    result: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const gen = await ctx.db.get(args.id);
    if (!gen || gen.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, {
      result: args.result,
      status: "completed",
    });
  },
});

export const setError = mutation({
  args: {
    id: v.id("generations"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const gen = await ctx.db.get(args.id);
    if (!gen || gen.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, {
      error: args.error,
      status: "error",
    });
  },
});
