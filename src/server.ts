import express, { query } from "express";
import { PrismaClient } from "@prisma/client";
import { convertMinutesToHourString } from "./utils/convert-hour-string-to-minutes";
import { convertHourStringToMinutes } from "./utils/convert-minutes-to-hour-string";
import cors from "cors";

const app = express()

app.use(express.json())
app.use(cors())

const prisma = new PrismaClient({
   log: ['query']
})

app.get('/games', async (request, response) => {
   const games = await prisma.game.findMany({
      include: {
         _count: {
            select: {
               ads: true
            }
         }
      }
   })
   return response.json(games);
})

app.post('/games/:id/ads', async (request, response) => {
   const gameId = request.params.id;
   const body = request.body;

   // Pendente de realizar Validacoes => usar zod

   const ad = await prisma.ad.create({
      data: {
         gameId: gameId,
         name: body.name,
         yearsPlaying: body.yearsPlaying,
         discord: body.discord,
         weekDays: body.weekDays.join(','),
         hourStart: convertHourStringToMinutes(body.hourStart),
         hourEnd: convertHourStringToMinutes(body.hourEnd),
         useVoiceChannel: body.useVoiceChannel
      }
   })
   return response.status(201).json(ad)
})

app.get('/games/:id/ads', async (request, response) => {
   const gameId = request.params.id;

   const ads = await prisma.ad.findMany({
      where: {
         gameId,
      },
      select: {
         id: true,
         name: true,
         weekDays: true,
         useVoiceChannel: true,
         yearsPlaying: true,
         hourStart: true,
         hourEnd: true,
      },
      orderBy: {
         createdAt: 'desc',
      }
   })
   return response.json(ads.map(ad => {
      return {
         ...ad,
         weekDays: ad.weekDays.split(','),
         hourStart: convertMinutesToHourString(ad.hourStart),
         hourEnd: convertMinutesToHourString(ad.hourEnd)
      }
   }))
})

app.get('/ads/:id/discord', async (request, response) => {
   const adsId = request.params.id;
   const ad = await prisma.ad.findUniqueOrThrow({
      where: {
         id: adsId
      },
      select: {
         discord: true,
      }
   })

   return response.json(ad.discord)
})

app.listen(3333)