import React, { useState, useEffect } from 'react';
import { PostedContent, CharacterProfile } from '../types';
import { YouTubeIcon, InstagramIcon, TikTokIcon, FacebookIcon, DownloadIcon, CopyIcon } from './IconComponents';
import LoadingSpinner from './LoadingSpinner';

const PLATFORM_CONFIG = {
  youtube: { icon: YouTubeIcon, name: "YouTube", color: "text-red-500", url: "https://www.youtube.com/upload" },
  instagram: { icon: InstagramIcon, name: "Instagram", color: "text-pink-500", url: "https://www.instagram.com/create/select/" },
  tiktok: { icon: TikTokIcon, name: "TikTok", color: "text-cyan-400", url: "https://www.tiktok.com/upload" },
  facebook: { icon: FacebookIcon, name: "Facebook", color: "text-blue-500", url: "https://www.facebook.com/" },
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-slate-800/30 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-slate-700 ${className}`}>
      {children}
    </div>
);

const PlatformPostCard: React.FC<{ 
    platformKey: keyof typeof PLATFORM_CONFIG, 
    post: PostedContent, 
    characterName: string, 
    onCopy: (text: string) => void,
    videoBlobUrl: string | null;
}> = ({ platformKey, post, characterName, onCopy, videoBlobUrl }) => {
  const config = PLATFORM_CONFIG[platformKey];
  const content = post[platformKey];
  
  const getShareableText = (): string => {
    switch (platformKey) {
        case 'youtube': return `${post.youtube.title}\n\n${post.youtube.script}`;
        case 'instagram': return `${post.instagram.caption}\n\n${post.instagram.hashtags.join(' ')}`;
        case 'tiktok': return `${post.tiktok.caption}\n\n${post.tiktok.hashtags.join(' ')}`;
        case 'facebook': return `${post.facebook.text_post}\n\n${post.facebook.hashtags.join(' ')}`;
        default: return '';
    }
  };
  
  const shareableText = getShareableText();
  
  return (
      <div className="space-y-4 bg-slate-900/50 border border-slate-700 p-4 rounded-xl h-full flex flex-col transition-all duration-300 hover:border-brand-blue/50 hover:shadow-xl">
          <h3 className={`flex items-center gap-2 text-xl font-bold ${config.color}`}>
            <config.icon /> {config.name}
          </h3>
          <div className="flex-grow space-y-3 text-sm">
              { 'title' in content && <p><strong>Title:</strong> {content.title}</p>}
              { 'caption' in content && <p><strong>Caption:</strong> <span className="italic text-gray-300">"{content.caption}"</span></p>}
              { 'text_post' in content && <p className="italic text-gray-300">"{content.text_post}"</p>}
              { 'trending_sound' in content && <p><strong>Sound:</strong> {content.trending_sound}</p>}
              { 'hashtags' in content && Array.isArray(content.hashtags) && (
                  <div className="flex flex-wrap gap-x-2 gap-y-1">
                      {content.hashtags.map((tag: string) => <span key={tag} className="text-brand-blue font-semibold">{tag}</span>)}
                  </div>
              )}
          </div>
           {post.youtube.videoUrl && (
              <div className="mt-auto pt-4 flex gap-2">
                  <a href={videoBlobUrl ?? undefined} download={`${characterName}-${platformKey}-${post.id}.mp4`} className={`flex-1 flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-3 rounded-lg text-xs transition-colors ${!videoBlobUrl ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <DownloadIcon /> Download
                  </a>
                  <button onClick={() => { onCopy(shareableText); window.open(config.url, '_blank'); }} className="flex-1 flex items-center justify-center gap-2 bg-brand-purple hover:bg-opacity-80 text-white font-bold py-2 px-3 rounded-lg text-xs transition-colors">
                      <CopyIcon /> Post
                  </button>
              </div>
           )}
      </div>
  );
};
const MemoizedPlatformPostCard = React.memo(PlatformPostCard);

const PostCard: React.FC<{ post: PostedContent; character: CharacterProfile; onCopy: (text: string) => void }> = ({ post, character, onCopy }) => {
    const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
    const [isFetchingVideo, setIsFetchingVideo] = useState(false);
    const [videoError, setVideoError] = useState<string | null>(null);
    const videoUri = post.youtube.videoUrl;

    useEffect(() => {
        let objectUrl: string | null = null;
        if (!videoUri) return;

        const fetchVideo = async () => {
          setIsFetchingVideo(true);
          setVideoError(null);
          try {
            const response = await fetch(videoUri);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const blob = await response.blob();
            objectUrl = URL.createObjectURL(blob);
            setVideoBlobUrl(objectUrl);
          } catch (e) {
            console.error("Failed to fetch and create blob from video", e);
            setVideoError("Could not load video.");
          } finally {
            setIsFetchingVideo(false);
          }
        };

        fetchVideo();

        return () => {
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
          }
        };
    }, [videoUri]);

    return (
      <div className="animate-slide-in-up">
        <Card>
            <div className="mb-6 pb-4 border-b border-slate-700">
                <p className="text-sm text-gray-400">{post.timestamp.toLocaleString()}</p>
                <p className="text-center text-xl md:text-2xl text-gray-200 font-serif italic">"{post.scenario}"</p>
            </div>
            
            <div className="mb-6 rounded-xl overflow-hidden border border-slate-700 shadow-lg max-w-md mx-auto bg-black">
              {videoUri ? (
                <div className="w-full aspect-video bg-black flex items-center justify-center">
                  {isFetchingVideo && <div className="flex flex-col items-center gap-2 text-gray-300"><LoadingSpinner /><p>Loading secure video...</p></div>}
                  {videoError && <p className="text-red-400 p-4 text-center">{videoError}</p>}
                  {videoBlobUrl && (
                    <video
                        key={videoBlobUrl}
                        className="w-full h-full"
                        src={videoBlobUrl}
                        controls
                        autoPlay
                        muted
                        loop
                        playsInline
                    >
                        Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              ) : (
                <div className="w-full aspect-video bg-black flex items-center justify-center text-gray-400 p-4 text-center">
                  Video is being generated... this can take a few minutes.
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MemoizedPlatformPostCard platformKey="youtube" post={post} characterName={character.name} onCopy={onCopy} videoBlobUrl={videoBlobUrl} />
              <MemoizedPlatformPostCard platformKey="instagram" post={post} characterName={character.name} onCopy={onCopy} videoBlobUrl={videoBlobUrl} />
              <MemoizedPlatformPostCard platformKey="tiktok" post={post} characterName={character.name} onCopy={onCopy} videoBlobUrl={videoBlobUrl} />
              <MemoizedPlatformPostCard platformKey="facebook" post={post} characterName={character.name} onCopy={onCopy} videoBlobUrl={videoBlobUrl} />
            </div>
        </Card>
      </div>
    );
};

export default React.memo(PostCard);