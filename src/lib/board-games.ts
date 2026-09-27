import { z } from "astro/zod";
import boardGameData from "@assets/data/board-games.json";

const galleryImageSchema = z.object({
  url: z.url(),
  description: z.string().min(1),
});

const boardGameDataSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  box: z.object({
    coverUrl: z.string().regex(/^\/assets\/images\/[\w.-]+$/),
    color: z
      .string()
      .regex(/^#[0-9a-f]{6}$/i, "Expected a six-digit hex color"),
    dimensionsCm: z.object({
      width: z.number().positive().max(40),
      height: z.number().positive().max(40),
      depth: z.number().positive().max(20),
    }),
  }),
  gallery: z.array(galleryImageSchema).default([]),
  bggUrl: z.url(),
  playerCount: z.object({
    supported: z.string().min(1),
    recommended: z.string().min(1).optional(),
  }),
  time: z.string().min(1),
});

const coverImages = import.meta.glob<string>("/assets/images/*.webp", {
  eager: true,
  import: "default",
  query: "?url",
});

const resolveCoverUrl = (path: string) => {
  const url = coverImages[path];

  if (!url) {
    throw new Error(`Board game cover not found: ${path}`);
  }

  return url;
};

const parsedBoardGames = z.array(boardGameDataSchema).parse(boardGameData);

export const boardGames = parsedBoardGames.map((game) => {
  const coverUrl = resolveCoverUrl(game.box.coverUrl);

  return {
    ...game,
    box: {
      ...game.box,
      coverUrl,
    },
    gallery:
      game.gallery.length > 0
        ? game.gallery
        : [
            {
              url: coverUrl,
              description: `Portada del juego de mesa ${game.name}.`,
            },
          ],
  };
});

export type BoardGame = (typeof boardGames)[number];
