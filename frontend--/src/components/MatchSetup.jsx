import React from "react";
import { User, Users, Play, Trophy } from "lucide-react";

export default function MatchSetup({
  category,
  setCategory,
  player1,
  setPlayer1,
  player2,
  setPlayer2,
  partner1,
  setPartner1,
  partner2,
  setPartner2,
  onStartMatch,
}) {
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

        <form onSubmit={onStartMatch} style={styles.form}>
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
};
