"use client";
import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { motion, AnimatePresence } from "framer-motion";
import processingAnimation from "@/lottie/Voice-line_wave_animation.json";

interface ProcessingDownloadProps {
  type: "video" | "audio" | "metaInfo";
}

const ProcessingDownload: React.FC<ProcessingDownloadProps> = ({ type }) => {
  const messages = {
    video: [
      "Preparing Video...",
      "Downloading Video Stream...",
      "Downloading Audio Stream...",
      "Merging Video and Audio...",
      "Optimizing Video Quality...",
      "Generating Preview...",
      "Creating Public Link...",
      "Finalizing Video...",
      "Preparing for Download...",
      "Download Ready!",
    ],
    audio: [
      "Preparing Audio...",
      "Extracting Audio Stream...",
      "Optimizing Audio Quality...",
      "Normalizing Volume Levels...",
      "Creating Public Link...",
      "Finalizing Audio...",
      "Preparing for Download...",
      "Download Ready!",
      "Merging Audio Tracks...",
    ],
    metaInfo: [
      "Initializing Video Fetch...",
      "Retrieving Video Metadata...",
      "Fetching Available Formats...",
      "Checking Video Quality Options...",
      "Loading Thumbnails and Preview...",
      "Analyzing Audio Streams...",
      "Preparing Video Details...",
      "Finalizing Video Info...",
      "Ready to Download!",
    ],
  };

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages[type].length);
    }, 5000); // change message every 5 seconds

    return () => clearInterval(interval);
  }, [type]);

  return (
    <AnimatePresence>
      <>
        {/* Overlay with fade-in */}
        <motion.div
          className="fixed inset-0 bg-blend-multiply bg-opacity-20 backdrop-blur-sm z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal Content with slide-up animation */}
        <motion.div
          className="fixed inset-0 flex flex-col items-center justify-center z-[10000] pointer-events-none"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          {/* Animated message */}
          <div className="mb-4 h-6">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentIndex} // important to animate when index changes
                className="text-fuchsia-300 font-semibold text-lg select-none"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {messages[type][currentIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="w-2xl h-72">
            <Lottie
              animationData={processingAnimation}
              loop={true}
              autoplay={true}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
};

export default ProcessingDownload;
