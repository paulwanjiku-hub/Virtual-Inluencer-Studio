
import React from 'react';
import { CharacterProfile } from '../types';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-slate-800/30 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-slate-700 ${className}`}>
    {children}
  </div>
);

const CharacterHeader: React.FC<{ character: CharacterProfile }> = ({ character }) => {
  return (
    <Card>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-brand-purple to-brand-pink shadow-lg flex-shrink-0">
          <img src={character.profileImageUrl} alt={character.name} className="w-full h-full rounded-full object-cover border-4 border-slate-800"/>
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold">{character.name}</h1>
          <p className="text-gray-400 mt-1">{character.backstory}</p>
          <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
            {[...character.personality, ...character.interests].map(tag => (
              <span key={tag} className="bg-slate-700 text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default React.memo(CharacterHeader);
