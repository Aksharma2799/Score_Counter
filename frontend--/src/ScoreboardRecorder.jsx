import React, { useState, useRef, useEffect } from 'react';
import { Square, RefreshCw, Circle, User, Users, Play } from 'lucide-react';

export default function ScoreOverlayRecorder() {
  // Setup State
  const [isConfigured, setIsConfigured] = useState(false);
  const [category, setCategory] = useState('singles'); // 'singles' or 'doubles'

  // Names State
  const [player1, setPlayer1] = useState('Player 1');
  const [player2, setPlayer2] = useState('Player 2');
  const [team1Player2, setTeam1Player2] = useState('Partner 1');
  const [team2Player2, setTeam2Player2] = useState('Partner 2');

  // Match State
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [server, setServer] = useState(1); // 1 or 2
  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const animationFrameId = useRef(null);

  // Reference payload for live Canvas rendering
  const stateRef = useRef({ category, player1, player2, team1Player2, team2Player2, score1, score2, server });
  useEffect(() => {
    stateRef.current = { category, player1, player2, team1Player2, team2Player2, score1, score2, server };
  }, [category, player1, player2, team1Player2, team2Player2, score1, score2, server]);

  // Start Camera once setup is completed
  useEffect(() => {
    if (!isConfigured) return;

    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
      }
    }
    setupCamera();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isConfigured]);

  // Canvas Drawing Loop (Burns Overlay directly into Video)
  const drawCanvas = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    // 1. Draw Camera Frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 2. Overlay Parameters
    const { category, player1, player2, team1Player2, team2Player2, score1, score2, server } = stateRef.current;
    
    const x = 30;
    const y = 30;
    const width = 460;
    const isDoubles = category === 'doubles';
    const rowHeight = isDoubles ? 65 : 45;

    // Background Card
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, width, rowHeight * 2 + 10, 10);
    ctx.fill();
    ctx.stroke();

    // Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(x + 10, y + rowHeight + 5);
    ctx.lineTo(x + width - 10, y + rowHeight + 5);
    ctx.stroke();

    // --- Row 1: Side 1 ---
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    if (isDoubles) {
      ctx.fillText(player1, x + 20, y + 28);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(`& ${team1Player2}`, x + 20, y + 48);
    } else {
      ctx.fillText(player1, x + 20, y + 32);
    }

    // Score Side 1
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#4ADE80';
    ctx.fillText(score1.toString(), x + 260, y + (isDoubles ? 38 : 32));

    // Serve Badge Side 1
    if (server === 1) {
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#FACC15';
      ctx.fillText('🎾 SERVE', x + 330, y + (isDoubles ? 36 : 32));
    }

    // --- Row 2: Side 2 ---
    const y2 = y + rowHeight + 5;
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    if (isDoubles) {
      ctx.fillText(player2, x + 20, y2 + 28);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(`& ${team2Player2}`, x + 20, y2 + 48);
    } else {
      ctx.fillText(player2, x + 20, y2 + 32);
    }

    // Score Side 2
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#22D3EE';
    ctx.fillText(score2.toString(), x + 260, y2 + (isDoubles ? 38 : 32));

    // Serve Badge Side 2
    if (server === 2) {
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#FACC15';
      ctx.fillText('🎾 SERVE', x + 330, y2 + (isDoubles ? 36 : 32));
    }

    animationFrameId.current = requestAnimationFrame(drawCanvas);
  };

  const startRecording = () => {
    drawCanvas();

    const canvas = canvasRef.current;
    const audioStream = videoRef.current?.srcObject?.getAudioTracks()[0];
    const canvasStream = canvas.captureStream(30);
    if (audioStream) canvasStream.addTrack(audioStream);

    recordedChunksRef.current = [];
    const recorder = new MediaRecorder(canvasStream, { mimeType: 'video/webm' });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    }
  };

  // 1. SETUP MODAL SCREEN (Shown First)
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl">
          <h1 className="text-2xl font-black bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-6 text-center">
            Badminton Match Setup
          </h1>

          {/* Category Switcher */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Select Category</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCategory('singles')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-sm transition ${
                  category === 'singles' 
                    ? 'bg-green-500/10 border-green-500 text-green-400' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                <User className="w-4 h-4" /> Singles
              </button>
              <button
                type="button"
                onClick={() => setCategory('doubles')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-sm transition ${
                  category === 'doubles' 
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                <Users className="w-4 h-4" /> Doubles
              </button>
            </div>
          </div>

          {/* Player Name Form */}
          <div className="space-y-4 mb-8">
            {/* Side 1 Input(s) */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-green-400 uppercase block mb-2">
                {category === 'singles' ? 'Player 1' : 'Team 1'}
              </span>
              <input 
                type="text" 
                placeholder="Name"
                value={player1} 
                onChange={(e) => setPlayer1(e.target.value)} 
                className="w-full bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-700 text-sm mb-2"
              />
              {category === 'doubles' && (
                <input 
                  type="text" 
                  placeholder="Partner Name"
                  value={team1Player2} 
                  onChange={(e) => setTeam1Player2(e.target.value)} 
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-700 text-sm"
                />
              )}
            </div>

            {/* Side 2 Input(s) */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-cyan-400 uppercase block mb-2">
                {category === 'singles' ? 'Player 2' : 'Team 2'}
              </span>
              <input 
                type="text" 
                placeholder="Name"
                value={player2} 
                onChange={(e) => setPlayer2(e.target.value)} 
                className="w-full bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-700 text-sm mb-2"
              />
              {category === 'doubles' && (
                <input 
                  type="text" 
                  placeholder="Partner Name"
                  value={team2Player2} 
                  onChange={(e) => setTeam2Player2(e.target.value)} 
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-700 text-sm"
                />
              )}
            </div>
          </div>

          <button
            onClick={() => setIsConfigured(true)}
            className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 text-slate-950 font-extrabold py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-slate-950" /> Start Scoreboard & Camera
          </button>
        </div>
      </div>
    );
  }

  // 2. MAIN MATCH & RECORDING SCREEN
  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white p-4 justify-between">
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />

      {/* Main Canvas Stream */}
      <div className="relative w-full h-[75vh] bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full object-contain" />
      </div>

      {/* Control Bar */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-wrap gap-4 items-center justify-between">
        
        {/* Score Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={() => { setScore1(s => s + 1); setServer(1); }} 
            className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded-lg"
          >
            +1 {player1} {category === 'doubles' ? '& Partner' : ''}
          </button>
          <button 
            onClick={() => { setScore2(s => s + 1); setServer(2); }} 
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2 rounded-lg"
          >
            +1 {player2} {category === 'doubles' ? '& Partner' : ''}
          </button>
          <button 
            onClick={() => setServer(s => s === 1 ? 2 : 1)} 
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-3 py-2 rounded-lg border border-slate-700 text-sm"
          >
            Switch Serve
          </button>
        </div>

        {/* Recording Controls */}
        <div className="flex gap-3">
          {!recording ? (
            <button 
              onClick={startRecording} 
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 font-bold px-4 py-2 rounded-lg"
            >
              <Circle className="w-4 h-4 fill-white animate-pulse" /> Record Match
            </button>
          ) : (
            <button 
              onClick={stopRecording} 
              className="flex items-center gap-2 bg-slate-800 text-red-400 font-bold px-4 py-2 rounded-lg border border-red-500/50"
            >
              <Square className="w-4 h-4 fill-red-400" /> Stop & Save Video
            </button>
          )}

          {recordedUrl && (
            <a 
              href={recordedUrl} 
              download={`badminton_${category}_match.webm`} 
              className="bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-lg"
            >
              Download Recorded Video
            </a>
          )}

          <button 
            onClick={() => setIsConfigured(false)} 
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg border border-slate-700"
            title="Reconfigure Match"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}