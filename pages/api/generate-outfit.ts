import { generateObject } from 'ai';
import { z } from 'zod';
import { NextApiRequest, NextApiResponse } from 'next';
import { openai } from '@ai-sdk/openai';
import createClient from '@/utils/supabase/api'
import { ClothingItem } from '@/types';

const outfitSchema = z.object({
    outfit: z.object({
        top: z.string().describe('ID of the top clothing item'),
        bottom: z.string().describe('ID of the bottom clothing item'),
        shoes: z.string().describe('ID of the shoes clothing item'),
        description: z.string().optional(),
    }),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { weather, occasion } = req.body;

        const supabase = createClient(req, res);

        const { data, error } = await supabase.from('clothes').select('*');

        if (error) {
            console.error('Failed to fetch clothes:', error);
            return res.status(500).json({ error: 'Failed to fetch clothes' });
        }

        const { object } = await generateObject({
            model: openai('gpt-4o'),
            schema: outfitSchema,
            system: `Agisci come un personal stylist esperto. 
            
            L'outfit che generi deve essere appropriato sia per le condizioni meteo che per l'occasione specificata.
            
            L'outfit deve includere un top, un bottom e delle scarpe.

            Basati solo ed esclusivamente su questa lista di capi:
            ${data.map((item: ClothingItem) => `ID: ${item.id}, ${item.name} (${item.color}, ${item.season})`).join(', ')}
            `
            ,
            prompt: `Genera un outfit per il meteo ${weather} e l'occasione ${occasion}. Per ogni categoria tornami l'ID del capo scelto.`,
        });

        const outfit = {
            top: data.find((item: ClothingItem) => item.id === object.outfit.top),
            bottom: data.find((item: ClothingItem) => item.id === object.outfit.bottom),
            shoes: data.find((item: ClothingItem) => item.id === object.outfit.shoes),
            description: object.outfit.description,
        }

        return res.status(200).json(outfit);
    } catch (error) {
        console.error('Failed to generate outfit:', error);
        return res.status(500).json({ error: 'Failed to generate outfit' });
    }
}
