import { useState, useRef } from "react";

export function useMediaRecorder(videoRef, canvasRef, drawCanvas, stopCanvas) {
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
      return true;
    } catch (err) {
      alert("Camera and Microphone permission required to run recorder.");
      console.error(err);
      return false;
    }
  };

  const startRecording = () => {
    drawCanvas();
    const canvas = canvasRef.current;
    const audioTrack = videoRef.current?.srcObject?.getAudioTracks()[0];

    const stream = canvas.captureStream(30);
    if (audioTrack) stream.addTrack(audioTrack);

    recordedChunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);
      setRecordedUrl(URL.createObjectURL(blob));
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      stopCanvas();
    }
  };

  const uploadToBackend = async () => {
    if (!recordedBlob) return;
    setUploadStatus("Uploading...");

    const formData = new FormData();
    formData.append("video", recordedBlob, "match.webm");

    try {
      const response = await fetch("http://localhost:5000/api/upload-video", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setUploadStatus("Uploaded to Backend successfully!");
      } else {
        setUploadStatus("Upload failed.");
      }
    } catch (err) {
      console.error(err);
      setUploadStatus("Server connection failed.");
    }
  };

  return {
    recording,
    recordedUrl,
    uploadStatus,
    startCamera,
    startRecording,
    stopRecording,
    uploadToBackend,
  };
}
