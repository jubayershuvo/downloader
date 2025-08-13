import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

export const s3 = new S3Client({
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: "auto",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export async function uploadStreamToR2(key, stream, contentType) {
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: stream,
      ContentType: contentType,
      ACL: "public-read",
    },
    queueSize: 4, // concurrency for parts
    partSize: 10 * 1024 * 1024, // 10 MB per part
    leavePartsOnError: false,
  });

  upload.on("httpUploadProgress", (progress) => {
    function formatSize(bytes) {
      if (bytes === 0) return "0 Bytes";

      const units = ["Bytes", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));

      const size = bytes / Math.pow(1024, i);
      return `${size.toFixed(2)} ${units[i]}`;
    }

    const loadedSize = formatSize(progress.loaded);
    const totalSize = progress.total ? formatSize(progress.total) : "unknown";
    console.log(
      `Uploaded ${(progress.loaded/progress.total)*100}%  (${loadedSize}/${totalSize})`
    );
  });

  await upload.done();
  return `${process.env.R2_PUBLIC_DOMAIN}/${key}`;
}

export const isFileExistsInR2 = async (key) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      Prefix: key,
    });
    const data = await s3.send(command);

    if (data.Contents && data.Contents.length > 0) {
      return `${process.env.R2_PUBLIC_DOMAIN}/${key}`;
    }
    return null;
  } catch (error) {
    console.error("Error checking file in R2:", error);
    throw error;
  }
};

export const delete1DayOldFiles = async () => {
  try {
    // 1️⃣ List files
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
    });
    const data = await s3.send(listCommand);

    if (!data.Contents) return;

    const oneDayAgo = new Date(Date.now() - 1000 * 60 * 60 * 24);

    // 2️⃣ Filter old files
    const objectsToDelete = data.Contents.filter(
      (obj) => new Date(obj.LastModified) < oneDayAgo
    );

    // 3️⃣ Delete them
    const deletePromises = objectsToDelete.map((obj) =>
      s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: obj.Key,
        })
      )
    );

    await Promise.all(deletePromises);

    console.log(`Deleted ${objectsToDelete.length} files older than 1 day.`);
  } catch (error) {
    console.error("Error deleting from R2:", error);
    throw error;
  }
};
