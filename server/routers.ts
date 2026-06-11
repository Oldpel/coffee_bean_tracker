import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ Coffee Beans Router ============
  coffeeBeans: router({
    // 获取用户的所有咖啡豆
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserCoffeeBeans(ctx.user.id);
    }),

    // 获取单个咖啡豆详情
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const bean = await db.getCoffeeBeanById(input.id, ctx.user.id);
        if (!bean) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Coffee bean not found" });
        }
        return bean;
      }),

    // 创建新咖啡豆
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1, "豆子名称不能为空"),
          origin: z.string().optional(),
          processingMethod: z.string().optional(),
          roastLevel: z.string().optional(),
          purchaseDate: z.date(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const bean = await db.createCoffeeBean({
          userId: ctx.user.id,
          ...input,
        });
        if (!bean) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create coffee bean" });
        }
        return bean;
      }),

    // 更新咖啡豆
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          origin: z.string().optional(),
          processingMethod: z.string().optional(),
          roastLevel: z.string().optional(),
          purchaseDate: z.date().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        const bean = await db.updateCoffeeBean(id, ctx.user.id, updates);
        if (!bean) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Coffee bean not found" });
        }
        return bean;
      }),

    // 删除咖啡豆
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const success = await db.deleteCoffeeBean(input.id, ctx.user.id);
        if (!success) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Coffee bean not found" });
        }
        return { success: true };
      }),
  }),

  // ============ Brewing Records Router ============
  brewingRecords: router({
    // 获取某个咖啡豆的所有冲煮记录
    listByBean: protectedProcedure
      .input(z.object({ beanId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getBeanBrewingRecords(input.beanId, ctx.user.id);
      }),

    // 获取用户最近的冲煮记录
    getRecent: protectedProcedure
      .input(z.object({ limit: z.number().default(5) }))
      .query(async ({ ctx, input }) => {
        return db.getUserRecentBrewingRecords(ctx.user.id, input.limit);
      }),

    // 获取单条冲煮记录
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const record = await db.getBrewingRecordById(input.id, ctx.user.id);
        if (!record) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Brewing record not found" });
        }
        return record;
      }),

    // 创建冲煮记录
    create: protectedProcedure
      .input(
        z.object({
          beanId: z.number(),
          brewDate: z.date(),
          brewMethod: z.string().optional(),
          waterTemperature: z.number().optional(),
          grindSize: z.string().optional(),
          coffeeAmount: z.number().optional(),
          waterAmount: z.number().optional(),
          brewTime: z.number().optional(),
          tasteRating: z.number().min(1).max(10).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // 验证豆子所有权
        const bean = await db.getCoffeeBeanById(input.beanId, ctx.user.id);
        if (!bean) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Coffee bean not found" });
        }

        const record = await db.createBrewingRecord({
          userId: ctx.user.id,
          ...input,
          coffeeAmount: input.coffeeAmount ? String(input.coffeeAmount) : undefined,
          waterAmount: input.waterAmount ? String(input.waterAmount) : undefined,
        } as any);

        if (!record) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create brewing record" });
        }
        return record;
      }),

    // 更新冲煮记录
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          brewDate: z.date().optional(),
          brewMethod: z.string().optional(),
          waterTemperature: z.number().optional(),
          grindSize: z.string().optional(),
          coffeeAmount: z.number().optional(),
          waterAmount: z.number().optional(),
          brewTime: z.number().optional(),
          tasteRating: z.number().min(1).max(10).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        const record = await db.updateBrewingRecord(id, ctx.user.id, {
          ...updates,
          coffeeAmount: updates.coffeeAmount ? String(updates.coffeeAmount) : undefined,
          waterAmount: updates.waterAmount ? String(updates.waterAmount) : undefined,
        } as any);

        if (!record) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Brewing record not found" });
        }
        return record;
      }),

    // 删除冲煮记录
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const success = await db.deleteBrewingRecord(input.id, ctx.user.id);
        if (!success) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Brewing record not found" });
        }
        return { success: true };
      }),
  }),

  // ============ AI Brewing Suggestions Router ============
  brewingSuggestions: router({
    // 根据咖啡豆属性生成冲煮建议
    generate: protectedProcedure
      .input(
        z.object({
          beanId: z.number(),
          roastLevel: z.string().optional(),
          processingMethod: z.string().optional(),
          origin: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          // 验证豆子所有权
          const bean = await db.getCoffeeBeanById(input.beanId, ctx.user.id);
          if (!bean) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Coffee bean not found" });
          }

          // 构建 LLM 提示词
          const roastLevel = input.roastLevel || bean.roastLevel || "未指定";
          const processingMethod = input.processingMethod || bean.processingMethod || "未指定";
          const origin = input.origin || bean.origin || "未指定";

          const prompt = `你是一位专业的咖啡冲煮师。根据下列咖啡豆的属性，提供个性化的冲煮建议。

咖啡豆属性：
- 产地：${origin}
- 处理法：${processingMethod}
- 烘焙度：${roastLevel}

请提供以下冲煮参数的建议（以JSON格式输出）：
1. 水温（摄氏度，范围 85-96）
2. 研磨度（粗/中粗/中/中细/细）
3. 粉水比（例如 1:16, 1:17 等）
4. 冲煮时间（秒，范围 150-300）
5. 冲煮方式建议（手冲/摩卡壶/意式机等）
6. 冲煮提示（简要的提示文案）

输出格式：
{
  "waterTemperature": 整数,
  "grindSize": "字符串",
  "coffeeToWaterRatio": "字符串",
  "brewTime": 整数,
  "brewMethods": ["字符串", ...],
  "tips": "字符串"
}`;

          const response = await invokeLLM({
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
          });

          // 解析 LLM 响应
          const messageContent = response.choices[0]?.message?.content;
          const content = typeof messageContent === 'string' ? messageContent : '';
          
          // 提取 JSON 部分
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (!jsonMatch || !content) {
            throw new Error("无效的响应格式");
          }

          const suggestion = JSON.parse(jsonMatch[0]);

          return {
            success: true,
            suggestion: {
              waterTemperature: suggestion.waterTemperature || 92,
              grindSize: suggestion.grindSize || "中细",
              coffeeToWaterRatio: suggestion.coffeeToWaterRatio || "1:16",
              brewTime: suggestion.brewTime || 180,
              brewMethods: suggestion.brewMethods || ["手冲"],
              tips: suggestion.tips || "小火慢冲，享受冲煮的乐趣",
            },
          };
        } catch (error: any) {
          console.error("[AI Brewing Suggestions] Error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "生成建议失败",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
