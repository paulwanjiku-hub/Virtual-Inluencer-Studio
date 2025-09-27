import { GoogleGenAI, Type } from "@google/genai";
import { CharacterProfile, ContentIdeas, YouTubeShortsIdea, InstagramPostIdea, TikTokIdea, FacebookPostIdea } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCharacterImage = async (visualDescription: string, artStyle: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `A high-resolution profile picture of a digital influencer. Art Style: ${artStyle}. Description: ${visualDescription}. Suitable for social media. Clean, vibrant, detailed.`,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      throw new Error("Image generation failed, no images returned.");
    }
  } catch (error) {
    console.error("Error generating character image:", error);
    throw error;
  }
};

const generateVideoForScenario = async (scenario: string, characterDescription: string): Promise<string | undefined> => {
  console.log("Starting video generation...");
  try {
    const prompt = `A short, cinematic video clip of ${characterDescription}. Scenario: "${scenario}". This is for a social media short or reel. High quality, visually engaging.`;
    
    let operation = await ai.models.generateVideos({
      model: 'veo-2-generate-001',
      prompt: prompt,
      config: {
        numberOfVideos: 1
      }
    });

    // Poll for completion, as video generation is asynchronous and takes time.
    while (!operation.done) {
      console.log("Polling video generation status... Please wait.");
      // Wait for 10 seconds before checking the status again.
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (downloadLink) {
      console.log("Video generation successful.");
      // The API key must be appended to the URI to create an accessible download link.
      return `${downloadLink}&key=${process.env.API_KEY}`;
    } else {
      console.warn("Video generation finished, but no video URI was found.");
      return undefined;
    }
  } catch (error) {
    console.error("Error during video generation:", error);
    // Return undefined instead of throwing, so text content can still be displayed.
    return undefined;
  }
};


export const generateContentIdeas = async (character: CharacterProfile): Promise<ContentIdeas> => {
  try {
    // 1. Generate Scenario
    const scenarioPrompt = `My virtual influencer is named ${character.name}. Their personality is ${character.personality.join(', ')} and their interests include ${character.interests.join(', ')}. Generate a short, interesting, and visually appealing scenario for their "day in the life". The scenario should be something that can be easily translated into a short video or a series of images. Keep it concise, under 50 words.`;
    
    const scenarioResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: scenarioPrompt,
        config: {
            systemInstruction: "You are a creative writer who generates exciting daily scenarios for a virtual influencer."
        }
    });
    const scenario = scenarioResponse.text.trim();

    // 2. Generate Content Ideas for all platforms in parallel
    const [youtubeResponse, instagramResponse, tiktokResponse, facebookResponse] = await Promise.all([
      // YouTube Idea
      ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Based on this scenario: "${scenario}", generate a YouTube Short idea for a virtual influencer named ${character.name}. The output must be in JSON format. Provide a "title" (catchy and short), a "script" (a brief voiceover or dialogue, max 3-4 lines), and a "visuals" description (a brief shot-by-shot idea).`,
          config: {
              responseMimeType: "application/json",
              systemInstruction: "You are a social media content strategist specializing in YouTube Shorts. Respond only with the requested JSON object.",
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      title: { type: Type.STRING },
                      script: { type: Type.STRING },
                      visuals: { type: Type.STRING },
                  },
                  required: ["title", "script", "visuals"],
              },
          },
      }),
      // Instagram Idea
      ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Based on this scenario: "${scenario}", generate an Instagram Reel idea for a virtual influencer named ${character.name}. The output must be in JSON format. Provide a "caption" (engaging and includes a question to prompt comments), an "image_description" (what the reel should show), and "hashtags" (an array of 5-7 relevant and trending hashtags).`,
          config: {
              responseMimeType: "application/json",
              systemInstruction: "You are a social media manager crafting engaging Instagram posts. Respond only with the requested JSON object.",
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      caption: { type: Type.STRING },
                      image_description: { type: Type.STRING },
                      hashtags: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                      },
                  },
                  required: ["caption", "image_description", "hashtags"],
              },
          },
      }),
       // TikTok Idea
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Based on this scenario: "${scenario}", generate a TikTok video idea for a virtual influencer named ${character.name}. The output must be in JSON format. Provide a "caption" (short, punchy, and attention-grabbing), a "trending_sound" suggestion (e.g., "upbeat synth-pop track" or "viral comedy sound"), and "hashtags" (an array of 3-5 relevant and trending hashtags including #fyp).`,
        config: {
            responseMimeType: "application/json",
            systemInstruction: "You are a TikTok content expert who knows what goes viral. Respond only with the requested JSON object.",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    caption: { type: Type.STRING },
                    trending_sound: { type: Type.STRING },
                    hashtags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                    },
                },
                required: ["caption", "trending_sound", "hashtags"],
            },
        },
      }),
      // Facebook Idea
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Based on this scenario: "${scenario}", generate a Facebook video post idea for a virtual influencer named ${character.name}. The output must be in JSON format. Provide a "text_post" (a slightly longer, more descriptive post to encourage discussion) and "hashtags" (an array of 3-5 relevant hashtags).`,
        config: {
            responseMimeType: "application/json",
            systemInstruction: "You are a community manager who writes engaging Facebook posts. Respond only with the requested JSON object.",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    text_post: { type: Type.STRING },
                    hashtags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                    },
                },
                required: ["text_post", "hashtags"],
            },
        },
      })
    ]);
    
    const youtubeIdea: YouTubeShortsIdea = JSON.parse(youtubeResponse.text);
    const instagramIdea: InstagramPostIdea = JSON.parse(instagramResponse.text);
    const tiktokIdea: TikTokIdea = JSON.parse(tiktokResponse.text);
    const facebookIdea: FacebookPostIdea = JSON.parse(facebookResponse.text);

    // 3. Generate one Video for all platforms based on the scenario
    const videoUrl = await generateVideoForScenario(scenario, character.visualDescription);

    // 4. Attach video URL to all content ideas
    youtubeIdea.videoUrl = videoUrl;
    instagramIdea.videoUrl = videoUrl;
    tiktokIdea.videoUrl = videoUrl;
    facebookIdea.videoUrl = videoUrl;

    return {
      scenario,
      youtube: youtubeIdea,
      instagram: instagramIdea,
      tiktok: tiktokIdea,
      facebook: facebookIdea
    };

  } catch (error) {
    console.error("Error generating content ideas:", error);
    throw error;
  }
};