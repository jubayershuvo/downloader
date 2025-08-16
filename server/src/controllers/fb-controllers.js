import videoModel from "../models/video-model.js";
import { isFileExistsInR2, uploadStreamToR2 } from "../utils/r2Client.js";
import ytdlp from "yt-dlp-exec";
import { extractYTVideoId } from "../utils/get-id.js";
import fs from "fs";
import path from "path";
import { makeSafeR2Key } from "../utils/tools.js";

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
  const formatMap = {
    "4320p": ["337"], // 8K VP9
    "2160p": ["315", "313", "272", "330"], // 4K VP9 & AVC (including rare 330)
    "1440p": ["308", "271"],
    "1080p": ["303", "299", "137", "248", "94"], // 1080p VP9 & AVC
    "720p": ["302", "136", "247", "95"], // 720p VP9 & AVC
    "480p": ["135", "244", "96"],
    "360p": ["134", "243"],
    "240p": ["133", "242"],
    "144p": ["160", "278"],

    // Audio-only (just for reference, usually handled separately)
    audio: ["140", "251", "141", "249", "250", "139"],
  };

  const getIdsByResolution = (resolution) => {
    if (resolution in formatMap) {
      return formatMap[resolution];
    }
    // If resolution not found, return all IDs
    return Object.values(formatMap).flat();
  };

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
      ...videoInfo.formats.audio,
    ].find((f) => f.format_id === format_id);

    if (!requestedFormat) {
      return res.status(404).json({ error: "Requested format not found" });
    }

    const safeTitle = sanitize(videoInfo.title);
    const tempDir = path.resolve("./temp");
    await fs.promises.mkdir(tempDir, { recursive: true });

    const videoFilePath = path.join(
      tempDir,
      `${safeTitle}-${sanitize(requestedFormat.resolution)}.mp4`
    );
    const audioFilePath = path.join(
      tempDir,
      `${safeTitle}-${sanitize(requestedFormat.resolution)}.mp3`
    );

    if (requestedFormat.included === "audio") {
      // AUDIO FLOW
      const r2Key = makeSafeR2Key(videoId, videoInfo.title, requestedFormat.resolution, "mp3");
      const audioExists = await isFileExistsInR2(r2Key);
      if (audioExists) {
        downloadCmd(audioExists, res);
        return;
      }

      await ytdlp(videoInfo.url, {
        format: `${format_id}/bestaudio/`,
        output: audioFilePath,
        noWarnings: true,
        noCheckCertificates: true,
        callHome: false,
        addHeader: ["referer:youtube.com", "user-agent:googlebot"],
        httpChunkSize: 1048576,
      });

      const publicUrl = await uploadStreamToR2(
        r2Key,
        fs.createReadStream(audioFilePath),
        "audio/mpeg"
      );
      await safeUnlink(audioFilePath);

      return downloadCmd(publicUrl, res);
    } else {
      // VIDEO + AUDIO FLOW
      const resolution =
        requestedFormat.resolution || formatMap[requestedFormat.format_id];

      if (!resolution) {
        return res.status(400).json({ error: "Invalid format_id" });
      }

      const possibleIds = getIdsByResolution(resolution);

      const formatString =
        possibleIds.map((id) => `${id}+140`).join("/") + "/best";
      console.log("Downloading video with format:", formatString);

      const r2Key = makeSafeR2Key(videoId, videoInfo.title, resolution, "mp4");
      const videoExists = await isFileExistsInR2(r2Key);
      if (videoExists) {
        return downloadCmd(videoExists, res);
      }

      await ytdlp(videoInfo.url, {
        format: `${format_id}+140/${formatString}`,
        mergeOutputFormat: "mp4",
        output: videoFilePath,
        noWarnings: true,
        noCheckCertificates: true,
        callHome: false,
        addHeader: ["referer:youtube.com", "user-agent:googlebot"],
        httpChunkSize: 1048576,
      });

      const publicUrl = await uploadStreamToR2(
        r2Key,
        fs.createReadStream(videoFilePath),
        "video/mp4"
      );
      await safeUnlink(videoFilePath);

      return downloadCmd(publicUrl, res);
    }
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

  const video_id = extractYTVideoId(url);

  try {
    // Check cache first
    const cachedInfo =
      (await videoModel.findOne({ videoId: video_id })) ||
      (await videoModel.findOne({ url }));
    if (cachedInfo) {
      return res.status(200).json(cachedInfo);
    }

    // Fetch info from yt-dlp
    const info = await ytdlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
      skipDownload: true,
      callHome: false,
      noPlaylist: true,
      format: "bestvideo+bestaudio/best",
      addHeader: ["referer:facebook.com", "user-agent:facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"],
    });


    // return res.status(200).json(info);

    if (!info || !Array.isArray(info.formats)) {
      return res.status(500).json({ error: "Invalid video info returned" });
    }

    const seenResolutions = new Set();
    const videoFormats = [];
    const audioFormats = [];

    // Iterate formats reversed (to prefer higher quality last for consistent overwrite)
    for (const f of info.formats.slice().reverse()) {
      // Keep only mp4/m4a/mp3 formats (adjust if needed)
      if (!["mp4", "m4a", "mp3"].includes(f.ext)) continue;

      // Skip formats without audio or video codec (none means no codec)
      if (f.vcodec === "none" && f.acodec === "none") continue;

      if (!f.url) continue;

      // Define resolution or fallback label
      const resolution = f.height
        ? `${f.height}p`
        : f.format_note || "audio only";

      // Avoid duplicate resolution entries (keep first encountered)
      if (seenResolutions.has(resolution)) continue;
      seenResolutions.add(resolution);

      const included =
        f.vcodec !== "none" && f.acodec !== "none"
          ? "audio+video"
          : f.vcodec !== "none"
          ? "video"
          : "audio";

      const ext = included === "audio" ? "mp3" : "mp4";

      const formatEntry = {
        format_id: f.format_id,
        resolution,
        ext,
        filesize: f.filesize ?? f.filesize_approx ?? null,
        url: f.url,
        included,
      };

      // Separate audio and video formats
      if (formatEntry.included === "audio") {
        audioFormats.push(formatEntry);
      } else if (formatEntry.included === "video") {
        videoFormats.push(formatEntry);
      } else if (formatEntry.included === "audio+video") {
        // If combined, you can decide where to push or store separately if needed
        videoFormats.push(formatEntry);
      }
    }

    // Sort video and audio formats by descending resolution or bitrate
    videoFormats.sort((a, b) => {
      const aRes = parseInt(a.resolution) || 0;
      const bRes = parseInt(b.resolution) || 0;
      return bRes - aRes;
    });

    audioFormats.sort((a, b) => {
      const aBitrate = a.filesize || 0;
      const bBitrate = b.filesize || 0;
      return bBitrate - aBitrate;
    });

    const videoInfo = {
      videoId: info.id,
      source: "facebook",
      title: info.title || "",
      thumbnail: info.thumbnail || "",
      description: info.description || "",
      uploader: info.uploader || "",
      uploadDate: info.upload_date || "",
      duration_string: info.duration_string || "",
      duration: info.duration || 0,
      viewCount: info.view_count || 0,
      likeCount: info.like_count || 0,
      dislikeCount: info.dislike_count || 0,
      uploaderUrl: info.uploader_url || "",
      formats: {
        video: videoFormats,
        audio: audioFormats,
      },
      url: url,
    };

    // Respond first
    res.status(200).json(videoInfo);

    // Save only if there are video or audio formats
    if (videoFormats.length > 0 || audioFormats.length > 0) {
      await videoModel.create(videoInfo);
    }
  } catch (e) {
    console.error("Error fetching video info:", e);
    return res.status(500).json({ error: "Failed to get video info" });
  }
};

export const playlistInfo = (req, res) => {
  res.status(200).json({
    message: "YouTube video info route is working!",
  });
};

export const playlistDownload = (req, res) => {
  res.status(200).json({
    message: "YouTube video info route is working!",
  });
};
