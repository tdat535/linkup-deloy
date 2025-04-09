import React from "react";
import { useEffect, useRef, useState } from "react";

const VideoThumbnail = ({ url }: { url: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 1; // Đặt thời gian lấy frame
    const captureFrame = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL("image/png");
        setThumbnail(imageUrl);
      }
    };

    video.addEventListener("loadeddata", captureFrame);
    return () => {
      video.removeEventListener("loadeddata", captureFrame);
    };
  }, [url]);

  return (
    <>
      {!thumbnail && (
        <video
          ref={videoRef}
          src={url}
          style={{ display: "none" }}
          crossOrigin="anonymous"
        />
      )}
      {thumbnail && (
        <img
          src={thumbnail}
          alt="Thumbnail"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}
    </>
  );
}
export default VideoThumbnail;