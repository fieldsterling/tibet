import { defineCollection, z } from 'astro:content';

const travelogs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    author: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
    cover: z.string().optional(),
    points: z.array(z.object({
      name: z.string(),
      lat: z.number(),
      lng: z.number(),
      date: z.date().optional(),
      desc: z.string(),
      image: z.string().optional()
    })).optional()
  })
});

const businesses = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    type: z.enum(['住宿', '餐饮', '交通', '补给', '其他']),
    lat: z.number(),
    lng: z.number(),
    tags: z.array(z.string()),
    images: z.array(z.string()).optional(),
    contact: z.string().optional(),
    website: z.string().url().optional()
  })
});

const histories = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    author: z.string(),
    era: z.array(z.number()),
    relatedPlaces: z.array(z.string()).optional(),
    events: z.array(z.object({
      year: z.number(),
      desc: z.string(),
      lat: z.number(),
      lng: z.number(),
      image: z.string().optional()
    }))
  })
});

const routes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    author: z.string(),
    type: z.enum(['修行', '探险', '朝圣']),
    points: z.array(z.object({
      name: z.string(),
      lat: z.number(),
      lng: z.number(),
      desc: z.string(),
      image: z.string().optional()
    }))
  })
});

export const collections = {
  travelogs,
  businesses,
  histories,
  routes
};
