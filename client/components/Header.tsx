// components/Header.tsx
import React from "react";

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-red-600 to-purple-700 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-white text-3xl font-extrabold select-none">
          🎬 YouTube Downloader
        </h1>
        <nav className="hidden sm:flex space-x-8 font-semibold text-white">
          <a
            href="#formats"
            className="hover:text-pink-300 transition-colors duration-300"
          >
            Formats
          </a>
          <a
            href="#info"
            className="hover:text-pink-300 transition-colors duration-300"
          >
            Info
          </a>
          <a
            href="https://github.com/yourrepo"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-300 transition-colors duration-300"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
