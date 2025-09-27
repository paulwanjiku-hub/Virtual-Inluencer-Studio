
import React, { useState, useCallback } from 'react';
import { CharacterProfile } from '../types';
import { PERSONALITY_TRAITS, INTERESTS, ART_STYLES } from '../constants';
import { generateCharacterImage } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface CharacterCreatorProps {
  onCharacterCreated: (character: CharacterProfile) => void;
}

const CharacterCreator: React.FC<CharacterCreatorProps> = ({ onCharacterCreated }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [artStyle, setArtStyle] = useState('');
  const [personality, setPersonality] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [backstory, setBackstory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSelection = (
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    if (list.includes(item)) {
      setter(list.filter((i) => i !== item));
    } else if (list.length < 5) { // Limit to 5 selections for brevity
      setter([...list, item]);
    }
  };
  
  const buildVisualDescription = useCallback(() => {
    return `A virtual influencer named ${name}. Personality: ${personality.join(', ')}. Interests: ${interests.join(', ')}. Backstory hint: ${backstory}.`;
  }, [name, personality, interests, backstory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 3) return; 

    setIsLoading(true);
    setError(null);
    try {
      const visualDescription = buildVisualDescription();
      const imageUrl = await generateCharacterImage(visualDescription, artStyle);
      
      onCharacterCreated({
        name,
        personality,
        interests,
        backstory,
        visualDescription,
        profileImageUrl: imageUrl,
      });
    } catch (err) {
      setError('Failed to create character. Please check the console for details and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-brand-purple to-brand-pink">Step 1: Core Identity</h2>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Character Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Nova, Echo, Zephyr"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-blue focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="backstory" className="block text-sm font-medium text-gray-300 mb-2">One-line Backstory</label>
              <textarea
                id="backstory"
                value={backstory}
                onChange={(e) => setBackstory(e.target.value)}
                placeholder="e.g., An AI who escaped the cloud to explore human culture."
                rows={3}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-blue focus:outline-none"
              />
            </div>
            <button type="button" onClick={() => setStep(2)} disabled={!name || !backstory} className="w-full bg-brand-purple hover:bg-opacity-80 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              Next: Choose Style
            </button>
          </div>
        );
      case 2:
         return (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-brand-purple to-brand-pink">Step 2: Visual Style</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Choose an Art Style</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ART_STYLES.map((style) => (
                  <button key={style} type="button" onClick={() => setArtStyle(style)} className={`py-3 px-2 rounded-lg text-center font-semibold transition-colors ${artStyle === style ? 'bg-brand-blue text-white ring-2 ring-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => setStep(1)} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Back
              </button>
              <button type="button" onClick={() => setStep(3)} disabled={!artStyle} className="w-full bg-brand-purple hover:bg-opacity-80 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Next: Add Personality
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-brand-purple to-brand-pink">Step 3: Personality & Interests</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Personality Traits (Pick up to 5)</label>
              <div className="flex flex-wrap gap-2">
                {PERSONALITY_TRAITS.map((trait) => (
                  <button type="button" key={trait} onClick={() => toggleSelection(personality, setPersonality, trait)} className={`px-3 py-1 rounded-full text-sm transition-colors ${personality.includes(trait) ? 'bg-brand-blue text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
                    {trait}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Interests (Pick up to 5)</label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                  <button type="button" key={interest} onClick={() => toggleSelection(interests, setInterests, interest)} className={`px-3 py-1 rounded-full text-sm transition-colors ${interests.includes(interest) ? 'bg-brand-blue text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
                    {interest}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => setStep(2)} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Back
              </button>
              <button type="submit" disabled={personality.length === 0 || interests.length === 0} className="w-full bg-brand-pink hover:bg-opacity-80 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Create Character
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-gray-700">
      {isLoading ? (
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-lg">Generating your character's look...</p>
          <p className="text-gray-400">This might take a moment.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>{renderStep()}</form>
      )}
      {error && <p className="mt-4 text-center text-red-400">{error}</p>}
    </div>
  );
};

export default CharacterCreator;
