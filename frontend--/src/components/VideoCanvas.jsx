import React from "react";

export default function VideoCanvas({ videoRef, canvasRef }) {
  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ display: "none" }}
      />
      <div style={styles.canvasWrapper}>
        <canvas ref={canvasRef} style={styles.canvas} />
      </div>
    </>
  );
}

const styles = {
  canvasWrapper: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: "16px",
    border: "1px solid #1E293B",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  canvas: { width: "100%", height: "100%", objectFit: "contain" },
};
