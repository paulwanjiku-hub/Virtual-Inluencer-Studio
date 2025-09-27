export interface CharacterProfile {
  name: string;
  personality: string[];
  interests: string[];
  backstory: string;
  visualDescription: string;
  profileImageUrl: string;
}

export interface YouTubeShortsIdea {
  title: string;
  script: string;
  visuals: string;
  videoUrl?: string;
}

export interface InstagramPostIdea {
  caption: string;
  image_description: string;
  hashtags: string[];
  videoUrl?: string;
}

export interface TikTokIdea {
    caption: string;
    trending_sound: string;
    hashtags: string[];
    videoUrl?: string;
}

export interface FacebookPostIdea {
    text_post: string;
    hashtags: string[];
    videoUrl?: string;
}

export interface ContentIdeas {
  scenario: string;
  youtube: YouTubeShortsIdea;
  instagram: InstagramPostIdea;
  tiktok: TikTokIdea;
  facebook: FacebookPostIdea;
}

export interface PostedContent extends ContentIdeas {
  id: string;
  timestamp: Date;
}