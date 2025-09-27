
import React from 'react';

interface HeaderProps {
    onReset?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReset }) => {
    return (
        <header className="bg-gray-800/30 backdrop-blur-md sticky top-0 z-10 border-b border-gray-700">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-purple to-brand-pink">
                    Virtual Influencer Studio
                </h1>
                {onReset && (
                    <button 
                        onClick={onReset}
                        className="bg-gray-700 hover:bg-red-600 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Create New
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
