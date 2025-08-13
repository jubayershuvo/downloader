import videoModel from "../models/video-model.js";
import { isFileExistsInR2, uploadStreamToR2 } from "../utils/r2Client.js";
import ytdlp from "yt-dlp-exec";
import { extractTikTokId, extractYTVideoId } from "../utils/get-id.js";
import fs from "fs";
import path from "path";
import slugify from "slugify"; // npm install slugify

const makeSafeR2Key = (videoId, title, formatId, ext) => {
  // Remove dangerous filesystem & HTTP chars, strip emojis
  const asciiTitle = slugify(title, {
    replacement: "-",
    remove: /[^\x00-\x7F]/g, // remove non-ASCII
    lower: false,
    strict: true,
    trim: true,
  });
  return `${videoId}/${asciiTitle}-${formatId}-jsCoder.${ext}`;
};

const downloadCmd = async (publicUrl, res) => {
  console.log("Downloading file from R2:", publicUrl);
  try {
    res.status(200).json({
      message: "File downloaded successfully",
      publicUrl: publicUrl,
    });
    return null;
  } catch (error) {
    console.error("Error downloading file from R2:", error);
    res.status(500).send("Error downloading file from R2");
    return null;
  }
};

export const videoDownload = async (req, res) => {
  const { format_id, videoId } = req.query;
  if (!format_id || !videoId) {
    return res.status(400).json({ error: "Missing format_id or videoId" });
  }

  const sanitize = (input) => input.replace(/[<>:"/\\|?*]+/g, "").trim();

  const safeUnlink = async (filepath) => {
    try {
      await fs.promises.unlink(filepath);
    } catch {
      console.log("Failed to delete file:", filepath);
    }
  };

  try {
    const videoInfo = await videoModel.findOne({ videoId });
    if (!videoInfo || !videoInfo.url) {
      return res.status(404).json({ error: "Video not found" });
    }

    const requestedFormat = [
      ...videoInfo.formats.video,
      ...videoInfo.formats.watermarked,
    ].find((f) => f.format_id === format_id);

    if (!requestedFormat) {
      return res.status(404).json({ error: "Requested format not found" });
    }

    const safeTitle = sanitize(videoInfo.title);
    const tempDir = path.resolve("./temp");
    await fs.promises.mkdir(tempDir, { recursive: true });

    const videoFilePath = path.join(
      tempDir,
      `${videoId}-${requestedFormat.resolution}.mp4`
    );

    // VIDEO + AUDIO FLOW
    const resolution = requestedFormat.resolution;

    if (!resolution) {
      return res.status(400).json({ error: "Invalid format_id" });
    }

    const r2Key = makeSafeR2Key(videoId, videoInfo.title, format_id, "mp4");

    const videoExists = await isFileExistsInR2(r2Key);
    if (videoExists) {
      return downloadCmd(videoExists, res);
    }

    await ytdlp(videoInfo.url, {
      format: format_id + "+ba/best",
      output: videoFilePath,
      noWarnings: true,
      noCheckCertificates: true,
      callHome: false,
      addHeader: [
        "referer:https://www.tiktok.com/",
        "user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113 Safari/537.36",
      ],
    });

    const publicUrl = await uploadStreamToR2(
      r2Key,
      fs.createReadStream(videoFilePath),
      "video/mp4"
    );
    await safeUnlink(videoFilePath);

    return downloadCmd(publicUrl, res);
  } catch (e) {
    console.error("Error downloading video:", e);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Failed to download video" });
    }
  }
};

export const videoInfo = async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "URL missing" });
  }

  try {
    // Cache check
    const videoId = extractTikTokId(url);
    if (!videoId) {
      return res.status(400).json({ error: "Invalid URL" });
    }
    console.log("Video ID:", videoId);

    const cachedInfo =
      (await videoModel.findOne({ videoId })) ||
      (await videoModel.findOne({ url: url }));
    if (cachedInfo) {
      console.log("Cache hit for TikTok video:", videoId);
      return res.status(200).json(cachedInfo);
    }

    // Fetch TikTok video metadata
    const info = await ytdlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
      skipDownload: true,
      callHome: false,
      noPlaylist: true,
      format: "bestvideo+bestaudio/best",
      addHeader: [
        "referer:https://www.tiktok.com/",
        "user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113 Safari/537.36",
      ],
    });

    if (!info || !Array.isArray(info.formats)) {
      return res.status(500).json({ error: "Invalid TikTok video info" });
    }

    const videoFormats = [];
    const watermarkedFormats = [];
    const seenResolutions = new Set();

    for (const f of info.formats) {
      if (!f.url || !["mp4", "m4a", "mp3"].includes(f.ext)) continue;

      const resolution = f.height
        ? `${f.height}p`
        : f.format_note || "audio only";

      if (seenResolutions.has(resolution)) continue;
      seenResolutions.add(resolution);

      const included =
        f.vcodec !== "none" && f.acodec !== "none"
          ? "audio+video"
          : f.vcodec !== "none"
          ? "video"
          : "audio";

      const formatEntry = {
        format_id: f.format_id,
        resolution,
        ext: included === "audio" ? "mp3" : "mp4",
        filesize: f.filesize ?? f.filesize_approx ?? null,
        url: f.url,
        included,
      };

      // Detect watermarked formats
      if (resolution.toLowerCase().includes("watermark")) {
        watermarkedFormats.push(formatEntry);
      } else {
        videoFormats.push(formatEntry);
      }
    }

    // Sort by resolution (highest first)
    videoFormats.sort(
      (a, b) => parseInt(b.resolution) - parseInt(a.resolution)
    );

    const videoData = {
      videoId: info.id,
      source: "tiktok",
      title: info.title || "",
      thumbnail: info.thumbnail || "",
      uploader: info.uploader || "",
      uploaderId: info.uploader_id || "",
      uploaderUrl: info.uploader_url || "",
      uploadDate: info.upload_date || "",
      duration_string: info.duration_string || "",
      duration: info.duration || 0,
      viewCount: info.view_count || 0,
      likeCount: info.like_count || 0,
      repostCount: info.repost_count || 0,
      commentCount: info.comment_count || 0,
      formats: {
        video: videoFormats,
        watermarked: watermarkedFormats,
      },
      url: url,
    };

    // Send response
    res.status(200).json(videoData);

    // Save to cache if formats exist
    if (videoFormats.length > 0 || watermarkedFormats.length > 0) {
      await videoModel.create(videoData);
    }
  } catch (error) {
    console.error("Error fetching TikTok video info:", error);
    res.status(500).json({ error: "Failed to get TikTok video info" });
  }
};
