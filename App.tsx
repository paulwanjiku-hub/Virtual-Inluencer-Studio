
import React, { useState } from 'react';
import { CharacterProfile } from './types';
import CharacterCreator from './components/CharacterCreator';
import ContentHub from './components/ContentHub';
import Header from './components/Header';

const App: React.FC = () => {
  const [character, setCharacter] = useState<CharacterProfile | null>(null);

  const handleCharacterCreated = (newCharacter: CharacterProfile) => {
    setCharacter(newCharacter);
  };
  
  const handleReset = () => {
    setCharacter(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 text-gray-100 font-sans">
      <Header onReset={character ? handleReset : undefined} />
      <main className="container mx-auto px-4 py-8">
        {character ? (
          <ContentHub character={character} />
        ) : (
          <CharacterCreator onCharacterCreated={handleCharacterCreated} />
        )}
      </main>
    </div>
  );
};

export default App;
