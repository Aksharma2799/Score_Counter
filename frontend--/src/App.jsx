import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import {
  User,
  Users,
  Play,
  Square,
  Circle,
  RefreshCw,
  Trophy,
  Download,
  Upload,
} from "lucide-react";

export default function App() {
  // Setup State
  const [isConfigured, setIsConfigured] = useState(false);
  const [category, setCategory] = useState("singles");
  const [player1, setPlayer1] = useState("Player 1");
  const [player2, setPlayer2] = useState("Player 2");
  const [partner1, setPartner1] = useState("Partner 1");
  const [partner2, setPartner2] = useState("Partner 2");

  // Match State
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [server, setServer] = useState(1);
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const animationFrameId = useRef(null);

  // Sync state reference for Canvas animation loop
  const stateRef = useRef({
    category,
    player1,
    player2,
    partner1,
    partner2,
    score1,
    score2,
    server,
  });
  useEffect(() => {
    stateRef.current = {
      category,
      player1,
      player2,
      partner1,
      partner2,
      score1,
      score2,
      server,
    };
  }, [category, player1, player2, partner1, partner2, score1, score2, server]);

  // Handle Match Start & Request Camera Permission
  const handleStartMatch = async (e) => {
    e.preventDefault();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });
      setIsConfigured(true);

      // Wait for DOM video element to attach stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      alert("Camera and Microphone permission required to run recorder.");
      console.error(err);
    }
  };

  // Canvas Drawing Loop (Burns Overlay directly into Video stream)
  const drawCanvas = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    // Draw Live Video Frame
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

    // Card Dimensions
    const x = 30;
    const y = 30;
    const width = 450;
    const rowHeight = isDoubles ? 60 : 45;

    // Overlay Card Background
    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, width, rowHeight * 2 + 10, 12);
    ctx.fill();
    ctx.stroke();

    // Divider Line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.beginPath();
    ctx.moveTo(x + 10, y + rowHeight + 5);
    ctx.lineTo(x + width - 10, y + rowHeight + 5);
    ctx.stroke();

    // Side 1 Text & Score
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

    // Side 2 Text & Score
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
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
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

  // ---------------- SETUP SCREEN ----------------
  if (!isConfigured) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.iconBadge}>
              <Trophy size={28} color="#4ADE80" />
            </div>
            <h1 style={styles.title}>Badminton Match Setup</h1>
            <p style={styles.subtitle}>
              Select match type and enter player details
            </p>
          </div>

          <form onSubmit={handleStartMatch} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>SELECT CATEGORY</label>
              <div style={styles.categoryGrid}>
                <button
                  type="button"
                  onClick={() => setCategory("singles")}
                  style={{
                    ...styles.categoryBtn,
                    ...(category === "singles"
                      ? styles.categoryBtnActiveGreen
                      : {}),
                  }}
                >
                  <User size={18} /> Singles
                </button>
                <button
                  type="button"
                  onClick={() => setCategory("doubles")}
                  style={{
                    ...styles.categoryBtn,
                    ...(category === "doubles"
                      ? styles.categoryBtnActiveCyan
                      : {}),
                  }}
                >
                  <Users size={18} /> Doubles
                </button>
              </div>
            </div>

            {/* Side 1 Inputs */}
            <div style={styles.teamCard}>
              <span style={styles.teamHeaderGreen}>
                {category === "singles" ? "PLAYER 1" : "TEAM 1"}
              </span>
              <input
                type="text"
                placeholder="Player 1 Name"
                value={player1}
                onChange={(e) => setPlayer1(e.target.value)}
                style={styles.input}
                required
              />
              {category === "doubles" && (
                <input
                  type="text"
                  placeholder="Partner Name"
                  value={partner1}
                  onChange={(e) => setPartner1(e.target.value)}
                  style={{ ...styles.input, marginTop: "8px" }}
                  required
                />
              )}
            </div>

            {/* Side 2 Inputs */}
            <div style={styles.teamCard}>
              <span style={styles.teamHeaderCyan}>
                {category === "singles" ? "PLAYER 2" : "TEAM 2"}
              </span>
              <input
                type="text"
                placeholder="Player 2 Name"
                value={player2}
                onChange={(e) => setPlayer2(e.target.value)}
                style={styles.input}
                required
              />
              {category === "doubles" && (
                <input
                  type="text"
                  placeholder="Partner Name"
                  value={partner2}
                  onChange={(e) => setPartner2(e.target.value)}
                  style={{ ...styles.input, marginTop: "8px" }}
                  required
                />
              )}
            </div>

            <button type="submit" style={styles.submitBtn}>
              <Play size={18} fill="#020617" /> Start Scoreboard & Camera
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---------------- RECORDING & HUD SCREEN ----------------
  return (
    <div style={styles.hudContainer}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ display: "none" }}
      />

      {/* Main Canvas Player HUD */}
      <div style={styles.canvasWrapper}>
        <canvas ref={canvasRef} style={styles.canvas} />
      </div>

      {/* Action Bar */}
      <div style={styles.controlBar}>
        <div style={styles.btnGroup}>
          <button
            onClick={() => {
              setScore1((s) => s + 1);
              setServer(1);
            }}
            style={styles.scoreBtnGreen}
          >
            +1 {player1}
          </button>
          <button
            onClick={() => {
              setScore2((s) => s + 1);
              setServer(2);
            }}
            style={styles.scoreBtnCyan}
          >
            +1 {player2}
          </button>
          <button
            onClick={() => setServer((s) => (s === 1 ? 2 : 1))}
            style={styles.secondaryBtn}
          >
            Switch Serve
          </button>
        </div>

        <div style={styles.btnGroup}>
          {!recording ? (
            <button onClick={startRecording} style={styles.recordBtn}>
              <Circle size={16} fill="#FFF" /> Record Match
            </button>
          ) : (
            <button onClick={stopRecording} style={styles.stopBtn}>
              <Square size={16} fill="#F87171" /> Stop & Save
            </button>
          )}

          {recordedUrl && (
            <>
              <a
                href={recordedUrl}
                download="match_overlay.webm"
                style={styles.downloadBtn}
              >
                <Download size={16} /> Save Local
              </a>
              <button onClick={uploadToBackend} style={styles.uploadBtn}>
                <Upload size={16} /> Upload Backend
              </button>
            </>
          )}

          <button
            onClick={() => setIsConfigured(false)}
            style={styles.iconBtn}
            title="Reset"
          >
            <RefreshCw size={18} color="#94A3B8" />
          </button>
        </div>
      </div>
      {uploadStatus && <div style={styles.toast}>{uploadStatus}</div>}
    </div>
  );
}

// Built-in Inline Styles to ensure perfect alignment
const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#020617",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "system-ui, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "440px",
    backgroundColor: "#0F172A",
    borderRadius: "16px",
    border: "1px solid #1E293B",
    padding: "32px",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)",
  },
  header: { textAlign: "center", marginBottom: "24px" },
  iconBadge: {
    width: "56px",
    height: "56px",
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px auto",
  },
  title: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#F8FAFC",
    margin: "0 0 6px 0",
  },
  subtitle: { fontSize: "13px", color: "#94A3B8", margin: 0 },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: "0.05em",
  },
  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  categoryBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #334155",
    backgroundColor: "#1E293B",
    color: "#94A3B8",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
  },
  categoryBtnActiveGreen: {
    borderColor: "#4ADE80",
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    color: "#4ADE80",
  },
  categoryBtnActiveCyan: {
    borderColor: "#22D3EE",
    backgroundColor: "rgba(34, 211, 238, 0.1)",
    color: "#22D3EE",
  },
  teamCard: {
    backgroundColor: "#020617",
    border: "1px solid #1E293B",
    borderRadius: "12px",
    padding: "14px",
  },
  teamHeaderGreen: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#4ADE80",
    letterSpacing: "0.05em",
    display: "block",
    marginBottom: "8px",
  },
  teamHeaderCyan: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#22D3EE",
    letterSpacing: "0.05em",
    display: "block",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #334155",
    backgroundColor: "#0F172A",
    color: "#FFFFFF",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  submitBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    backgroundColor: "#4ADE80",
    color: "#020617",
    fontWeight: "800",
    fontSize: "15px",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    marginTop: "8px",
  },

  hudContainer: {
    height: "100vh",
    backgroundColor: "#020617",
    display: "flex",
    flexDirection: "column",
    padding: "16px",
    gap: "16px",
    boxSizing: "border-box",
    fontFamily: "system-ui, sans-serif",
  },
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
  controlBar: {
    backgroundColor: "#0F172A",
    border: "1px solid #1E293B",
    borderRadius: "16px",
    padding: "12px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  btnGroup: { display: "flex", gap: "10px", alignItems: "center" },
  scoreBtnGreen: {
    backgroundColor: "#16A34A",
    color: "#FFF",
    fontWeight: "700",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  scoreBtnCyan: {
    backgroundColor: "#0891B2",
    color: "#FFF",
    fontWeight: "700",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  secondaryBtn: {
    backgroundColor: "#1E293B",
    color: "#CBD5E1",
    border: "1px solid #334155",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
  recordBtn: {
    backgroundColor: "#DC2626",
    color: "#FFF",
    fontWeight: "700",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  stopBtn: {
    backgroundColor: "#1E293B",
    color: "#F87171",
    border: "1px solid #EF4444",
    fontWeight: "700",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  downloadBtn: {
    backgroundColor: "#10B981",
    color: "#020617",
    fontWeight: "800",
    textDecoration: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "14px",
  },
  uploadBtn: {
    backgroundColor: "#6366F1",
    color: "#FFF",
    fontWeight: "700",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  iconBtn: {
    backgroundColor: "#1E293B",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  toast: {
    position: "fixed",
    bottom: "80px",
    right: "30px",
    backgroundColor: "#1E293B",
    color: "#4ADE80",
    padding: "12px 20px",
    borderRadius: "10px",
    border: "1px solid #334155",
    fontWeight: "700",
  },
};
