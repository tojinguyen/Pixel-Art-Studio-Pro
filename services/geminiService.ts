
import { GoogleGenAI, Modality } from "@google/genai";
import { Settings, GenerationType } from '../types';

export async function generatePixelArt(settings: Settings): Promise<string> {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let detailedPrompt = `Generate a high-quality pixel art asset.
    Style: ${settings.style}.
    Pixel Dimensions: ${settings.pixelSize.width}x${settings.pixelSize.height}.
    Color Palette: ${settings.colorPalette === 'Custom' ? `Use this specific hex palette: ${settings.customPalette}` : `Strictly adhere to the ${settings.colorPalette} color palette (${settings.colorPalette}).`}.
    Background: Must be transparent.
    Output format: a single PNG file.
    The art must be clean, clear, and perfectly aligned to the pixel grid. No anti-aliasing.
    
    Asset description: "${settings.prompt}"
    `;

    if (settings.generationType === GenerationType.AnimationSheet) {
        detailedPrompt += `
        This is an animation sprite sheet.
        Animation Type: ${settings.animation.animationType}.
        Frame Count: ${settings.animation.frameCount}.
        The sprite sheet must contain exactly ${settings.animation.frameCount} frames arranged horizontally in a single row.
        Each frame must be exactly ${settings.pixelSize.width}x${settings.pixelSize.height} pixels.
        The total image width must be ${settings.pixelSize.width * settings.animation.frameCount} pixels and height ${settings.pixelSize.height} pixels.
        `;
    }
     if (settings.generationType === GenerationType.ParallaxLayer) {
        detailedPrompt += `
        This is a parallax background layer. It should be seamlessly tileable horizontally.
        `;
    }


    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: detailedPrompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error("No image data found in the API response.");

    } catch (error) {
        console.error("Error generating pixel art:", error);
        throw new Error("Failed to generate asset. Please check the console for details.");
    }
}
