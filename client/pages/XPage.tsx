"use client";
import axios from "axios";
import React, { useState } from "react";
import { PlayCircle } from "lucide-react";
import { FiEye } from "react-icons/fi";
import { FaThumbsUp } from "react-icons/fa";
import ProcessingDownload from "@/components/ProcessingDownload";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "";

function XPage() {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [error, setError] = useState("");
  const [DownloadType, setDownloadType] = useState<
    "video" | "audio" | "metaInfo" | null
  >(null);

  console.log("Server URL:", SERVER_URL);

  const handleProcess = async () => {
    if (!url.includes("x.com")) {
      setError("Please paste a YouTube URL");
      setUrl("");
      return;
    }
    setError("");
    setVideoInfo(null);
    setDownloadType("metaInfo");
    try {
      const res = await axios.get(
        `${SERVER_URL}/yt/video/info?url=${encodeURIComponent(url)}`
      );
      setVideoInfo(res.data);
      setUrl(""); // Clear input after successful fetch
    } catch (err: any) {
      setError(err.message);
    }
    setDownloadType(null);
  };

  function formatDate(dateStr: string) {
    // Extract parts
    const year = dateStr.slice(0, 4);
    const monthNum = parseInt(dateStr.slice(4, 6), 10);
    const day = dateStr.slice(6, 8);

    // Month names array
    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];

    const monthName = months[monthNum - 1] || "???";

    return `${day}-${monthName}-${year}`;
  }

  function formatViews(num: number) {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
  }

  console.log(videoInfo);

  const handleDownload = async (format_id: string, type: any) => {
    try {
      setDownloadType(type);
      const url = `${SERVER_URL}/yt/video/download?videoId=${videoInfo.videoId}&format_id=${format_id}`;

      const res = await axios.get(url);
      const filePath = res.data.publicUrl;


      // Create an anchor element
      const link = document.createElement("a");
      link.href = `/get_file?url=${encodeURIComponent(filePath)}`;
      link.download = filePath.split("/").pop() || "downloaded_file";
      link.click();
      setDownloadType(null);
    } catch (error) {
      setDownloadType(null);
      console.error("Download error:", error);
      setError("Failed to download the file. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      {DownloadType && <ProcessingDownload type={DownloadType} />}

      {/* Background Animation */}
      {/* Header */}
      <div className="text-center mb-8 animate-fadeIn">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-500 drop-shadow-lg">
          YouTube Video Downloader
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Download in up to <span className="font-semibold">4K</span> or extract
          audio instantly
        </p>
      </div>

      {/* Input Section */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 w-full">
        <input
          type="text"
          placeholder="🎥 Paste YouTube URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 shadow-md focus:outline-none focus:ring-4 focus:ring-red-400 transition"
        />

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {!url ? (
            <button
               onClick={() => navigator?.clipboard?.readText().then(setUrl)}
              className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 transition text-gray-700 px-6 py-3 rounded-lg shadow-lg"
            >
              Paste
            </button>
          ) : (
            <button
              onClick={() => setUrl("")}
              className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 transition text-gray-700 px-6 py-3 rounded-lg shadow-lg"
            >
              Clear
            </button>
          )}
          <button
            onClick={handleProcess}
            disabled={DownloadType === "metaInfo"}
            className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 transition text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 justify-center transform hover:scale-105 active:scale-95"
          >
            <PlayCircle size={20} className="animate-pulse" />
            {DownloadType === "metaInfo" ? "Processing..." : "Process"}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 bg-red-50 p-3 rounded-lg mb-6 shadow text-center">
          {error}
        </p>
      )}

      {/* Video Info */}
      {videoInfo?.title && (
        <div className="animate-fadeIn">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col gap-6 p-6 hover:shadow-2xl transition">
            {/* Thumbnail & Formats */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Thumbnail */}
              <div className="relative group w-full md:w-1/2 aspect-video bg-black flex items-center justify-center rounded-lg overflow-hidden">
                <img
                  src={videoInfo.thumbnail}
                  alt={videoInfo.title}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <FiEye />
                  {formatViews(videoInfo.viewCount)}
                </span>
                <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  {videoInfo.duration_string}
                </span>
              </div>

              {/* Formats */}
              <div className="flex-1 flex flex-col gap-4">
                {/* Audio */}
                {videoInfo.formats?.audio?.length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow p-5 hover:shadow-lg transition">
                    <h3 className="text-lg font-semibold mb-3 text-green-700">
                      Audio Formats
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {videoInfo.formats.audio.map((a: any) => (
                        <button
                          onClick={() => handleDownload(a.format_id, "audio")}
                          key={a.format_id}
                          className="px-4 py-2 cursor-pointer bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm shadow transition transform hover:scale-105"
                        >
                          {a.resolution} ({a.ext.toUpperCase()})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video */}
                {videoInfo.formats?.video?.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow p-5 hover:shadow-lg transition">
                    <h3 className="text-lg font-semibold mb-3 text-purple-700">
                      Video Formats
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {videoInfo.formats.video.map((v: any) => (
                        <button
                          onClick={() => handleDownload(v.format_id, "video")}
                          key={v.format_id}
                          className="px-4 py-2 cursor-pointer bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm shadow transition transform hover:scale-105"
                        >
                          {v.resolution} ({v.ext.toUpperCase()})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <a
                href={videoInfo?.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {videoInfo.title}
                </h2>
              </a>
              <div className="text-sm flex items-center text-gray-500 mb-3 gap-2">
                <span>By</span>
                <a
                  className="font-bold"
                  href={videoInfo?.uploaderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {videoInfo.uploader}
                </a>

                <span>•</span>

                <div className="flex items-center gap-1">
                  <FaThumbsUp size={14} />
                  <span>{formatViews(videoInfo.likeCount)}</span>
                </div>

                <span>•</span>

                <span>{formatDate(videoInfo.uploadDate)}</span>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-line pr-2 custom-scrollbar max-h-96 overflow-y-auto">
                {videoInfo.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Animations & Scrollbar */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 1px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}

export default XPage;
