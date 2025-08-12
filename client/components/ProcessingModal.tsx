// components/ProcessingModal.tsx
"use client";
import React from "react";
import Lottie from "lottie-react";
import processingAnimation from "@/lottie/Voice-line_wave_animation.json"; // Adjust the path as needed


const ProcessingModal = () => {
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 g-opacity-20 backdrop-blur-sm z-[9999]" />

      {/* Modal Content */}
      <div className="fixed inset-0 flex flex-col items-center justify-center z-[10000] pointer-events-none">
        
           <p className="text-fuchsia-300 font-semibold text-lg select-none">
            Finding Video data
          </p>
          <div className="w-2xl h-72">
            <Lottie 
              animationData={processingAnimation} 
              loop={true} 
              autoplay={true} 
              style={{ width: "100%", height: "100%" }}
            />
          </div>
         

      </div>
    </>
  );
};

export default ProcessingModal;
