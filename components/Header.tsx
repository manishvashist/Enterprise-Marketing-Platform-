import React from 'react';

interface HeaderProps {
  currentView: 'campaign' | 'editor';
  setView: (view: 'campaign' | 'editor') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const navButtonStyle = "px-4 py-2 rounded-md text-sm font-medium transition-colors";
  const activeStyle = "bg-indigo-600 text-white";
  const inactiveStyle = "text-gray-300 hover:bg-gray-700 hover:text-white";

  return (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" opacity=".3"/>
              <path d="M12.88 4.62l-1.76.81L12 2l.88 3.43zM6.12 6.12l.81 1.76L4.62 7.12 2 6l3.43-.88zM4.62 16.88l1.76-.81L6 22l-.88-3.43zM16.88 19.38l.81-1.76L19.38 16.88 22 18l-3.43.88zM19.38 7.12l-1.76-.81L18 2l.88 3.43zM12 5c-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
              <path d="M12.88 19.38l-1.76-.81L12 22l.88-3.43zM7.12 4.62l1.76.81L8 2l-.88 3.43z"/>
           </svg>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Enterprise Marketing Platform
          </h1>
        </div>
        
        <nav className="flex items-center space-x-2 bg-gray-900/50 p-1 rounded-lg">
            <button 
              onClick={() => setView('campaign')}
              className={`${navButtonStyle} ${currentView === 'campaign' ? activeStyle : inactiveStyle}`}
              aria-current={currentView === 'campaign' ? 'page' : undefined}
            >
              Campaign Generator
            </button>
            <button 
              onClick={() => setView('editor')}
              className={`${navButtonStyle} ${currentView === 'editor' ? activeStyle : inactiveStyle}`}
              aria-current={currentView === 'editor' ? 'page' : undefined}
            >
              Image Editor
            </button>
        </nav>
      </div>
    </header>
  );
};
