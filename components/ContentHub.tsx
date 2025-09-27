import React, { useState, useEffect, useCallback } from 'react';
import { CharacterProfile, PostedContent, YouTubeShortsIdea, InstagramPostIdea, TikTokIdea, FacebookPostIdea } from '../types';
import { generateContentIdeas } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { YouTubeIcon, InstagramIcon, TikTokIcon, FacebookIcon } from './IconComponents';

interface ContentHubProps {
  character: CharacterProfile;
}

const POST_INTERVAL_MS = 20000;

const PLATFORM_CONFIG = {
  youtube: { icon: YouTubeIcon, name: "YouTube", color: "text-red-500", url: "https://www.youtube.com/upload" },
  instagram: { icon: InstagramIcon, name: "Instagram", color: "text-pink-500", url: "https://www.instagram.com/create/select/" },
  tiktok: { icon: TikTokIcon, name: "TikTok", color: "text-cyan-400", url: "https://www.tiktok.com/upload" },
  facebook: { icon: FacebookIcon, name: "Facebook", color: "text-blue-500", url: "https://www.facebook.com/" },
};

const ContentHub: React.FC<ContentHubProps> = ({ character }) => {
  const [posts, setPosts] = useState<PostedContent[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState('');

  const generateAndAddPost = useCallback(async () => {
    if (posts.length === 0) {
      setIsGenerating(true);
    }
    setError(null);
    try {
      const ideas = await generateContentIdeas(character);
      const newPost: PostedContent = {
        ...ideas,
        id: `post-${Date.now()}`,
        timestamp: new Date(),
      };
      setPosts(prevPosts => [newPost, ...prevPosts]);
    } catch (err) {
      setError('Failed to generate new content. Retrying shortly...');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [character, posts.length]);

  useEffect(() => {
    if (posts.length === 0) {
      generateAndAddPost();
    }
    const intervalId = setInterval(generateAndAddPost, POST_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [generateAndAddPost, posts.length]);
  
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    }, (err) => {
      console.error('Could not copy text: ', err);
      setCopySuccess('Failed to copy');
       setTimeout(() => setCopySuccess(''), 2000);
    });
  };
  
  const getShareableText = (platform: keyof typeof PLATFORM_CONFIG, post: PostedContent): string => {
    switch (platform) {
        case 'youtube': return `${post.youtube.title}\n\n${post.youtube.script}`;
        case 'instagram': return `${post.instagram.caption}\n\n${post.instagram.hashtags.join(' ')}`;
        case 'tiktok': return `${post.tiktok.caption}\n\n${post.tiktok.hashtags.join(' ')}`;
        case 'facebook': return `${post.facebook.text_post}\n\n${post.facebook.hashtags.join(' ')}`;
        default: return '';
    }
  };

  const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-700 ${className}`}>
      {children}
    </div>
  );
  
  const PlatformPostCard: React.FC<{ platformKey: keyof typeof PLATFORM_CONFIG, post: PostedContent }> = ({ platformKey, post }) => {
    const config = PLATFORM_CONFIG[platformKey];
    const content = post[platformKey];
    const shareableText = getShareableText(platformKey, post);
    
    return (
        <div className="space-y-4 bg-gray-900/50 p-4 rounded-lg h-full flex flex-col">
            <h3 className={`flex items-center gap-2 text-xl font-bold ${config.color}`}>
              <config.icon /> {config.name}
            </h3>
            <div className="flex-grow space-y-3 text-sm">
                { 'title' in content && <p><strong>Title:</strong> {content.title}</p>}
                { 'caption' in content && <p><strong>Caption:</strong> <span className="italic text-gray-300">"{content.caption}"</span></p>}
                { 'text_post' in content && <p className="italic text-gray-300">"{content.text_post}"</p>}
                { 'trending_sound' in content && <p><strong>Sound:</strong> {content.trending_sound}</p>}
                { 'hashtags' in content && content.hashtags && (
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                        {content.hashtags.map((tag: string) => <span key={tag} className="text-brand-blue">{tag}</span>)}
                    </div>
                )}
            </div>
             {post.youtube.videoUrl && (
                <div className="mt-auto pt-4 flex gap-2">
                    <a href={post.youtube.videoUrl} download={`${character.name}-${platformKey}-${post.id}.mp4`} className="flex-1 text-center bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg text-xs transition-colors">
                        Download Video
                    </a>
                    <button onClick={() => { handleCopyToClipboard(shareableText); window.open(config.url, '_blank'); }} className="flex-1 bg-brand-purple hover:bg-opacity-80 text-white font-bold py-2 px-3 rounded-lg text-xs transition-colors">
                        Copy & Post
                    </button>
                </div>
             )}
        </div>
    );
  };


  return (
    <div className="space-y-8 animate-fade-in">
      <Card>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img src={character.profileImageUrl} alt={character.name} className="w-32 h-32 rounded-full border-4 border-brand-purple shadow-lg"/>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold">{character.name}</h1>
            <p className="text-gray-400 mt-1">{character.backstory}</p>
            <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
              {[...character.personality, ...character.interests].map(tag => (
                <span key={tag} className="bg-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </Card>
      
      <div className="flex justify-center items-center gap-4 p-3 bg-gray-800 rounded-lg relative">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="font-semibold text-green-400">Live</span>
          </div>
          <span className="text-gray-400 text-center">
            {isGenerating && posts.length === 0 
              ? "Generating first post... Video creation may take a few minutes." 
              : `New post arriving in ~${POST_INTERVAL_MS / 1000} seconds.`}
          </span>
          {copySuccess && <div className="absolute right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-fade-in">{copySuccess}</div>}
      </div>

      {isGenerating && posts.length === 0 && (
        <div className="text-center py-8">
          <LoadingSpinner />
          <p className="mt-4 text-lg">Generating content for {character.name}'s feed...</p>
          <p className="text-sm text-gray-400">This includes a video and may take a moment.</p>
        </div>
      )}
      
      {error && <p className="text-center text-red-400 my-4">{error}</p>}
      
      <div className="space-y-12">
        {posts.map((post) => (
          <div key={post.id} className="animate-slide-in-up">
            <Card>
                <div className="mb-6 pb-4 border-b border-gray-700">
                    <p className="text-sm text-gray-400">{post.timestamp.toLocaleString()}</p>
                    <p className="text-center text-lg md:text-xl text-gray-300 italic">Scenario: "{post.scenario}"</p>
                </div>
                
                {post.youtube.videoUrl && (
                    <div className="mb-6 rounded-lg overflow-hidden border border-gray-700 shadow-inner max-w-md mx-auto">
                        <video
                            key={post.youtube.videoUrl}
                            className="w-full bg-black"
                            src={post.youtube.videoUrl}
                            controls
                            autoPlay
                            muted
                            loop
                            playsInline
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <PlatformPostCard platformKey="youtube" post={post} />
                  <PlatformPostCard platformKey="instagram" post={post} />
                  <PlatformPostCard platformKey="tiktok" post={post} />
                  <PlatformPostCard platformKey="facebook" post={post} />
                </div>
            </Card>
          </div>
        ))}
       </div>
    </div>
  );
};

export default ContentHub;