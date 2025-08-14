// components/Footer.tsx
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-purple-700 to-red-600 text-white py-6 shadow-inner mt-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-sm">
        <p>© {new Date().getFullYear()} All Snap Downloader. All rights reserved.</p>
        <p className="mt-2 sm:mt-0">
          Made with ❤️ by{" "}
          <a
            href="https://www.linkedin.com/in/jubayershuvo/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-pink-400 transition-colors duration-300"
          >
            Md Jubayer
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
