import { useEffect, useRef } from "react";

export function useCanvasOverlay(videoRef, canvasRef, state) {
  const animationFrameId = useRef(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const drawCanvas = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const {
      category,
      player1,
      player2,
      partner1,
      partner2,
      score1,
      score2,
      server,
    } = stateRef.current;
    const isDoubles = category === "doubles";

    const x = 30;
    const y = 30;
    const width = 450;
    const rowHeight = isDoubles ? 60 : 45;

    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 2;

    // Fallback for browsers lacking roundRect support
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x, y, width, rowHeight * 2 + 10, 12);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(x, y, width, rowHeight * 2 + 10);
      ctx.strokeRect(x, y, width, rowHeight * 2 + 10);
    }

    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.beginPath();
    ctx.moveTo(x + 10, y + rowHeight + 5);
    ctx.lineTo(x + width - 10, y + rowHeight + 5);
    ctx.stroke();

    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(player1, x + 20, y + 28);
    if (isDoubles) {
      ctx.font = "13px sans-serif";
      ctx.fillStyle = "#94A3B8";
      ctx.fillText(`& ${partner1}`, x + 20, y + 46);
    }
    ctx.font = "bold 24px sans-serif";
    ctx.fillStyle = "#4ADE80";
    ctx.fillText(score1.toString(), x + 270, y + (isDoubles ? 36 : 30));
    if (server === 1) {
      ctx.font = "bold 13px sans-serif";
      ctx.fillStyle = "#FACC15";
      ctx.fillText("🎾 SERVE", x + 340, y + (isDoubles ? 34 : 30));
    }

    const y2 = y + rowHeight + 5;
    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(player2, x + 20, y2 + 28);
    if (isDoubles) {
      ctx.font = "13px sans-serif";
      ctx.fillStyle = "#94A3B8";
      ctx.fillText(`& ${partner2}`, x + 20, y2 + 46);
    }
    ctx.font = "bold 24px sans-serif";
    ctx.fillStyle = "#22D3EE";
    ctx.fillText(score2.toString(), x + 270, y2 + (isDoubles ? 36 : 30));
    if (server === 2) {
      ctx.font = "bold 13px sans-serif";
      ctx.fillStyle = "#FACC15";
      ctx.fillText("🎾 SERVE", x + 340, y2 + (isDoubles ? 34 : 30));
    }

    animationFrameId.current = requestAnimationFrame(drawCanvas);
  };

  const stopCanvas = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  };

  return { drawCanvas, stopCanvas };
}
