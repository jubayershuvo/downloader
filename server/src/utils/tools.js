export const makeSafeR2Key = (videoId, title, resolution, ext) => {
  // Remove unsafe filesystem/URL characters, but KEEP spaces
  const cleanedTitle = title
    .replace(/[\/\\?%*:|"<>#&+=@!$^`~'[\]{};,]+/g, "") // remove bad chars
    .replace(/\s+/g, " ") // collapse multiple spaces into one
    .trim();

  return `${videoId}/${cleanedTitle} ${resolution} JSCoder.${ext}`;
};