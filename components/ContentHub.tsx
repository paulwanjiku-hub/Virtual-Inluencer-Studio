
import React, { useState, useEffect, useCallback } from 'react';
import { CharacterProfile, PostedContent } from '../types';
import { generateContentIdeas } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import CharacterHeader from './CharacterHeader';
import PostCard from './PostCard';

interface ContentHubProps {
  character: CharacterProfile;
}

const POST_INTERVAL_MS = 20000;
const LOADING_MESSAGES = [
    "Generating a unique scenario for your influencer...",
    "Crafting witty captions and trending hashtags...",
    "Warming up the video generation engine...",
    "This is where the magic happens! Please wait...",
    "Rendering cinematic shots for the video...",
    "Almost there! Polishing the final content..."
];

const ContentHub: React.FC<ContentHubProps> = ({ character }) => {
  const [posts, setPosts] = useState<PostedContent[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

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
    if (isGenerating && posts.length === 0) {
      const intervalId = setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = LOADING_MESSAGES.indexOf(prev);
          const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
          return LOADING_MESSAGES[nextIndex];
        });
      }, 3000);
      return () => clearInterval(intervalId);
    }
  }, [isGenerating, posts.length]);

  useEffect(() => {
    // Generate the first post immediately
    if (posts.length === 0) {
      generateAndAddPost();
    }
    
    // Set up an interval for subsequent posts
    const intervalId = setInterval(generateAndAddPost, POST_INTERVAL_MS);
    
    // Cleanup interval on component unmount
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

  return (
    <div className="space-y-8 animate-fade-in">
      <CharacterHeader character={character} />
      
      <div className="flex justify-center items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg relative shadow-md">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="font-semibold text-green-400">Live</span>
          </div>
          <span className="text-gray-400 text-center text-sm sm:text-base">
            {isGenerating && posts.length === 0 
              ? "Generating first post..."
              : `New post arriving in ~${POST_INTERVAL_MS / 1000} seconds.`}
          </span>
          {copySuccess && <div className="absolute right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-fade-in">{copySuccess}</div>}
      </div>

      {isGenerating && posts.length === 0 && (
        <div className="text-center py-8">
          <LoadingSpinner />
          <p className="mt-4 text-lg text-gray-200">Generating content for {character.name}'s feed...</p>
          <p className="text-sm text-gray-400 h-5 mt-1">{loadingMessage}</p>
        </div>
      )}
      
      {error && <p className="text-center text-red-400 my-4">{error}</p>}
      
      <div className="space-y-12">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} character={character} onCopy={handleCopyToClipboard} />
        ))}
       </div>
    </div>
  );
};

export default ContentHub;
