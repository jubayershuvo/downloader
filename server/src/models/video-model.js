import mongoose from "mongoose";

const formatSchema = new mongoose.Schema({
  format_id: { type: String, required: true },
  resolution: { type: String, required: true },
  ext: { type: String, required: true },
  filesize: { type: Number, default: null },
  url: { type: String, required: true },
  included: {
    type: String,
    enum: ["audio", "video", "audio+video"],
    required: true,
  },
});

const videoInfoSchema = new mongoose.Schema({
  videoId: { type: String, required: true, unique: true },
  source: { type: String, default: "youtube" },
  title: { type: String, required: true },
  thumbnail: { type: String },
  description: { type: String },
  uploader: { type: String },
  uploadDate: { type: String },
  duration_string: { type: String },
  duration: { type: Number },
  viewCount: { type: Number },
  likeCount: { type: Number },
  dislikeCount: { type: Number },
  uploaderUrl: { type: String },
  // playUrl: {
  //   audio: { type: String, default: "" },
  //   video: { type: String, default: "" },
  // },
  youtubeUrl: { type: String, required: true },

  formats: {
    audio: [formatSchema],
    video: [formatSchema],
  },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("VideoInfo", videoInfoSchema);
