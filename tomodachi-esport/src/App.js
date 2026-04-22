import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { db } from "./firebase";
import {
  collection, doc, setDoc, getDocs, updateDoc, addDoc,
  onSnapshot, deleteDoc, serverTimestamp, query, orderBy
} from "firebase/firestore";

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
  bg: "#0a0a0f",
  surface: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  red: "#dc2626",
  redDim: "rgba(220,38,38,0.15)",
  redBorder: "rgba(220,38,38,0.35)",
  cyan: "#00e5ff",
  cyanDim: "rgba(0,229,255,0.1)",
  gold: "#eab308",
  purple: "#a855f7",
  green: "#16a34a",
  text: "#fff",
  muted: "#888",
  faint: "#444",
  font: "'Rajdhani', sans-serif",
  fontDisplay: "'Orbitron', sans-serif",
};

const gameColor = (g) => g === "eFootball" ? T.cyan : g === "CoDM" ? "#ff6b35" : T.purple;
const gameEmoji = (g) => g === "eFootball" ? "⚽" : g === "CoDM" ? "🎯" : "⚔️";

// ─── CONTEXT ─────────────────────────────────────────────────────────────────
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

// ─── NOTIFICATION ─────────────────────────────────────────────────────────────
function Notif({ msg, type }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
      background: type === "error" ? "#dc2626" : T.green,
      color: "#fff", padding: "11px 28px", borderRadius: 10, zIndex: 9999,
      fontFamily: T.font, fontWeight: 700, fontSize: 15,
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)", whiteSpace: "nowrap",
      animation: "fadeIn 0.2s ease"
    }}>{msg}</div>
  );
}

// ─── CARD ──────────────────────────────────────────────────────────────────
function Card({ children, style = {}, highlight = false }) {
  return (
    <div style={{
      background: highlight ? T.redDim : T.surface,
      border: `1px solid ${highlight ? T.redBorder : T.border}`,
      borderRadius: 14, padding: 16, marginBottom: 12, ...style
    }}>{children}</div>
  );
}

function Btn({ children, onClick, color = T.red, style = {}, small = false }) {
  return (
    <div onClick={onClick} style={{
      background: `linear-gradient(135deg, ${color}, ${color}bb)`,
      borderRadius: 9, padding: small ? "7px 14px" : "12px",
      textAlign: "center", cursor: "pointer",
      fontFamily: T.fontDisplay, fontSize: small ? 11 : 13,
      fontWeight: 700, letterSpacing: 1, color: "#fff",
      userSelect: "none", transition: "opacity 0.15s", ...style
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >{children}</div>
  );
}

function Input({ value, onChange, placeholder, type = "text", style = {} }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{
        width: "100%", background: "rgba(255,255,255,0.06)",
        border: `1px solid ${T.border}`, borderRadius: 9,
        padding: "10px 14px", color: T.text, fontFamily: T.font,
        fontSize: 14, outline: "none", boxSizing: "border-box", ...style
      }} />
  );
}

function Select({ value, onChange, children, style = {} }) {
  return (
    <select value={value} onChange={onChange} style={{
      width: "100%", background: "#111118", border: `1px solid ${T.border}`,
      borderRadius: 9, padding: "10px 14px", color: T.text,
      fontFamily: T.font, fontSize: 14, outline: "none", ...style
    }}>{children}</select>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>{children}</div>;
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontFamily: T.fontDisplay, fontSize: 12, color: T.muted, letterSpacing: 2, marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${T.border}` }}>
      {children}
    </div>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
function Header({ currentUser, setCurrentUser, players }) {
  const coins = players.find(p => p.name === currentUser)?.coins ?? 0;
  return (
    <div style={{ background: "rgba(10,10,15,0.95)", borderBottom: `1px solid ${T.border}`, padding: "14px 16px", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 900, color: T.red, letterSpacing: 2, textShadow: `0 0 20px ${T.redBorder}` }}>TOMODACHI</div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 9, color: T.faint, letterSpacing: 4 }}>E-SPORT · PARIS</div>
          </div>
          <div style={{ background: T.redDim, border: `1px solid ${T.redBorder}`, borderRadius: 8, padding: "5px 12px", textAlign: "right" }}>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 900, color: T.red }}>{coins.toLocaleString()}</div>
            <div style={{ fontSize: 9, color: T.muted, letterSpacing: 2 }}>TOMOCOINS</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 12, color: T.muted, whiteSpace: "nowrap" }}>Joueur :</div>
          <Select value={currentUser} onChange={e => setCurrentUser(e.target.value)} style={{ padding: "5px 10px", fontSize: 13 }}>
            {players.map(p => <option key={p.id} value={p.name} style={{ background: "#111118" }}>{p.name} — {gameEmoji(p.game)} {p.game}</option>)}
          </Select>
        </div>
      </div>
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
function BottomNav() {
  const navItems = [
    { to: "/", label: "Accueil", icon: "🏠" },
    { to: "/matchs", label: "Matchs", icon: "⚔️" },
    { to: "/paris", label: "Paris", icon: "🎯" },
    { to: "/classement", label: "Top", icon: "🏆" },
    { to: "/admin", label: "Admin", icon: "⚙️" },
  ];
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 480, background: "rgba(10,10,15,0.97)",
      borderTop: `1px solid ${T.border}`, display: "flex", zIndex: 100,
      backdropFilter: "blur(16px)"
    }}>
      {navItems.map(n => (
        <NavLink key={n.to} to={n.to} end={n.to === "/"} style={({ isActive }) => ({
          flex: 1, padding: "10px 4px 8px", textAlign: "center",
          textDecoration: "none", fontSize: 9, fontWeight: 700,
          letterSpacing: 0.5, fontFamily: T.font,
          color: isActive ? T.red : T.faint,
          borderTop: isActive ? `2px solid ${T.red}` : "2px solid transparent",
          transition: "all 0.2s"
        })}>
          <div style={{ fontSize: 18, marginBottom: 2 }}>{n.icon}</div>
          {n.label}
        </NavLink>
      ))}
    </nav>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function Home() {
  const { currentUser, players, bets, matches } = useApp();
  const player = players.find(p => p.name === currentUser);
  const myBets = bets.filter(b => b.user === currentUser);
  const upcomingCount = matches.filter(m => m.status === "upcoming").length;
  const totalBetPool = bets.reduce((s, b) => s + b.amount, 0);

  return (
    <div>
      {/* Hero balance */}
      <div style={{
        background: `linear-gradient(135deg, rgba(220,38,38,0.2), rgba(0,229,255,0.08))`,
        border: `1px solid ${T.redBorder}`, borderRadius: 16, padding: "24px 20px",
        marginBottom: 14, textAlign: "center", position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, rgba(220,38,38,0.15), transparent)` }} />
        <div style={{ fontFamily: T.fontDisplay, fontSize: 10, color: T.muted, letterSpacing: 3, marginBottom: 8 }}>TON SOLDE</div>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 42, fontWeight: 900, color: T.red, lineHeight: 1 }}>{(player?.coins ?? 0).toLocaleString()}</div>
        <div style={{ fontSize: 13, color: T.muted, marginTop: 6 }}>TomoCoins · {player?.game}</div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Matchs à venir", value: upcomingCount, color: T.cyan },
          { label: "Tes paris", value: myBets.length, color: T.purple },
          { label: "Pool total", value: totalBetPool, color: T.gold },
        ].map((s, i) => (
          <Card key={i} style={{ textAlign: "center", padding: 12, marginBottom: 0 }}>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 900, color: s.color }}>{s.value.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: T.muted, marginTop: 3 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Recent bets */}
      <Card>
        <SectionTitle>MES DERNIERS PARIS</SectionTitle>
        {myBets.length === 0 && <div style={{ fontSize: 13, color: T.faint, textAlign: "center", padding: 12 }}>Aucun pari pour l'instant</div>}
        {myBets.slice(-4).reverse().map((b, i) => {
          const m = matches.find(x => x.id === b.matchId);
          const won = m?.result === b.pick;
          return (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < Math.min(myBets.length, 4) - 1 ? `1px solid ${T.border}` : "none" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Sur {b.pick}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{m?.p1} vs {m?.p2}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.red }}>{b.amount} TC</div>
                {m?.status === "done" && <div style={{ fontSize: 11, color: won ? T.green : T.red }}>{won ? "✓ Gagné" : "✗ Perdu"}</div>}
                {m?.status === "upcoming" && <div style={{ fontSize: 11, color: T.muted }}>⏳ En cours</div>}
              </div>
            </div>
          );
        })}
      </Card>

      {/* Upcoming matches preview */}
      <Card>
        <SectionTitle>PROCHAINS MATCHS</SectionTitle>
        {matches.filter(m => m.status === "upcoming").slice(0, 3).map(m => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{m.p1}</div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 10, color: T.red, padding: "0 10px" }}>VS</div>
            <div style={{ fontSize: 13, fontWeight: 700, flex: 1, textAlign: "right" }}>{m.p2}</div>
          </div>
        ))}
        {matches.filter(m => m.status === "upcoming").length === 0 && <div style={{ fontSize: 13, color: T.faint, textAlign: "center", padding: 8 }}>Aucun match prévu</div>}
      </Card>
    </div>
  );
}

// ─── MATCHS PAGE ──────────────────────────────────────────────────────────────
function Matchs() {
  const { matches, bets } = useApp();
  const upcoming = matches.filter(m => m.status === "upcoming");
  const done = matches.filter(m => m.status === "done");

  const MatchCard = ({ m, finished }) => {
    const matchBets = bets.filter(b => b.matchId === m.id);
    const pool = matchBets.reduce((s, b) => s + b.amount, 0);
    const p1Bets = matchBets.filter(b => b.pick === m.p1).length;
    const p2Bets = matchBets.filter(b => b.pick === m.p2).length;
    const total = p1Bets + p2Bets || 1;

    return (
      <Card highlight={!finished}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: gameColor(m.game), background: `rgba(255,255,255,0.06)`, padding: "3px 8px", borderRadius: 4 }}>
            {gameEmoji(m.game)} {m.game}
          </span>
          {finished
            ? <span style={{ fontSize: 11, color: T.green, fontFamily: T.fontDisplay }}>✓ TERMINÉ</span>
            : <span style={{ fontSize: 11, color: T.muted }}>🔥 {matchBets.length} paris · {pool} TC</span>
          }
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: finished && m.result === m.p1 ? T.green : T.text }}>{m.p1}</div>
            {!finished && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{Math.round((p1Bets / total) * 100)}% des paris</div>}
          </div>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 14, color: T.red, padding: "0 14px" }}>VS</div>
          <div style={{ flex: 1, textAlign: "right" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: finished && m.result === m.p2 ? T.green : T.text }}>{m.p2}</div>
            {!finished && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{Math.round((p2Bets / total) * 100)}% des paris</div>}
          </div>
        </div>

        {!finished && pool > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.round((p1Bets / total) * 100)}%`, background: `linear-gradient(90deg, ${T.red}, ${T.cyan})`, borderRadius: 2 }} />
            </div>
          </div>
        )}

        {finished && (
          <div style={{ marginTop: 10, textAlign: "center", fontFamily: T.fontDisplay, fontSize: 12, color: T.gold }}>
            🏆 Vainqueur : {m.result}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div>
      <SectionTitle>MATCHS À VENIR ({upcoming.length})</SectionTitle>
      {upcoming.length === 0 && <Card><div style={{ color: T.faint, textAlign: "center", fontSize: 13, padding: 8 }}>Aucun match prévu pour l'instant</div></Card>}
      {upcoming.map(m => <MatchCard key={m.id} m={m} finished={false} />)}

      {done.length > 0 && (
        <>
          <SectionTitle style={{ marginTop: 8 }}>MATCHS TERMINÉS ({done.length})</SectionTitle>
          {done.map(m => <MatchCard key={m.id} m={m} finished={true} />)}
        </>
      )}
    </div>
  );
}

// ─── PARIS PAGE ───────────────────────────────────────────────────────────────
function Paris() {
  const { currentUser, players, matches, bets, setBets, setPlayers, showNotif } = useApp();
  const [matchId, setMatchId] = useState("");
  const [pick, setPick] = useState("");
  const [amount, setAmount] = useState("");
  const upcoming = matches.filter(m => m.status === "upcoming");
  const selected = matches.find(m => m.id === matchId);
  const myCoins = players.find(p => p.name === currentUser)?.coins ?? 0;

  const placeBet = () => {
    if (!selected) return showNotif("Choisis un match", "error");
    if (!pick) return showNotif("Choisis un joueur", "error");
    const amt = parseInt(amount);
    if (!amt || amt <= 0) return showNotif("Montant invalide", "error");
    if (amt > myCoins) return showNotif("Pas assez de TomoCoins !", "error");
    if (bets.find(b => b.user === currentUser && b.matchId === matchId)) return showNotif("Tu as déjà parié sur ce match !", "error");

    setBets(prev => [...prev, { id: Date.now().toString(), user: currentUser, matchId, pick, amount: amt }]);
    setPlayers(prev => prev.map(p => p.name === currentUser ? { ...p, coins: p.coins - amt } : p));
    setMatchId(""); setPick(""); setAmount("");
    showNotif(`Pari de ${amt} TC sur ${pick} ! 🔥`);
  };

  return (
    <div>
      <Card>
        <SectionTitle>PLACER UN PARI</SectionTitle>

        <div style={{ marginBottom: 12 }}>
          <Label>CHOISIR UN MATCH</Label>
          <Select value={matchId} onChange={e => { setMatchId(e.target.value); setPick(""); }}>
            <option value="" style={{ background: "#111118" }}>Sélectionne un match...</option>
            {upcoming.map(m => <option key={m.id} value={m.id} style={{ background: "#111118" }}>{gameEmoji(m.game)} {m.p1} vs {m.p2}</option>)}
          </Select>
        </div>

        {selected && (
          <div style={{ marginBottom: 12 }}>
            <Label>PARIER SUR</Label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[selected.p1, selected.p2].map(p => (
                <div key={p} onClick={() => setPick(p)} style={{
                  background: pick === p ? T.redDim : T.surface,
                  border: `1px solid ${pick === p ? T.redBorder : T.border}`,
                  borderRadius: 10, padding: "12px 8px", textAlign: "center",
                  cursor: "pointer", fontWeight: 700, fontSize: 14,
                  color: pick === p ? T.red : T.text, transition: "all 0.2s"
                }}>{p}</div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <Label>MONTANT (max: {myCoins.toLocaleString()} TC)</Label>
          <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Ex: 100" />
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {[50, 100, 250, 500].map(v => (
              <div key={v} onClick={() => setAmount(String(Math.min(v, myCoins)))} style={{
                flex: 1, background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 7, padding: "6px 0", textAlign: "center",
                cursor: "pointer", fontSize: 12, color: T.muted, fontWeight: 700
              }}>{v}</div>
            ))}
          </div>
        </div>

        <Btn onClick={placeBet}>🎯 PARIER MAINTENANT</Btn>
      </Card>

      {/* Mes paris actifs */}
      <Card>
        <SectionTitle>MES PARIS ACTIFS</SectionTitle>
        {bets.filter(b => b.user === currentUser && matches.find(m => m.id === b.matchId)?.status === "upcoming").map((b, i) => {
          const m = matches.find(x => x.id === b.matchId);
          return (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${T.border}` }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>🎯 {b.pick}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{m?.p1} vs {m?.p2}</div>
              </div>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 14, fontWeight: 900, color: T.red }}>{b.amount} TC</div>
            </div>
          );
        })}
        {bets.filter(b => b.user === currentUser && matches.find(m => m.id === b.matchId)?.status === "upcoming").length === 0 &&
          <div style={{ fontSize: 13, color: T.faint, textAlign: "center", padding: 8 }}>Aucun pari actif</div>}
      </Card>
    </div>
  );
}

// ─── CLASSEMENT PAGE ──────────────────────────────────────────────────────────
function Classement() {
  const { players, bets, matches } = useApp();
  const sorted = [...players].sort((a, b) => b.coins - a.coins);

  const getStats = (name) => {
    const myBets = bets.filter(b => b.user === name);
    const finished = myBets.filter(b => matches.find(m => m.id === b.matchId)?.status === "done");
    const won = finished.filter(b => matches.find(m => m.id === b.matchId)?.result === b.pick);
    return { total: myBets.length, wins: won.length, wr: finished.length > 0 ? Math.round((won.length / finished.length) * 100) : 0 };
  };

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div>
      <SectionTitle>CLASSEMENT GÉNÉRAL</SectionTitle>
      {sorted.map((p, i) => {
        const stats = getStats(p.name);
        return (
          <Card key={p.id} highlight={i === 0} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontFamily: T.fontDisplay, fontSize: i < 3 ? 24 : 16, fontWeight: 900, color: i === 0 ? T.gold : i === 1 ? "#9ca3af" : i === 2 ? "#cd7c2f" : T.faint, width: 34, textAlign: "center" }}>
                {i < 3 ? medals[i] : `#${i + 1}`}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{p.name}</div>
                <div style={{ display: "flex", gap: 10, marginTop: 3 }}>
                  <span style={{ fontSize: 11, color: gameColor(p.game) }}>{gameEmoji(p.game)} {p.game}</span>
                  <span style={{ fontSize: 11, color: T.muted }}>{stats.total} paris</span>
                  <span style={{ fontSize: 11, color: stats.wr >= 50 ? T.green : T.red }}>{stats.wr}% win</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 900, color: i === 0 ? T.gold : T.red }}>{p.coins.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: T.muted }}>TC</div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
function Admin() {
  const { players, setPlayers, matches, setMatches, bets, setBets, showNotif } = useApp();
  const [unlocked, setUnlocked] = useState(false);
  const [pwd, setPwd] = useState("");
  const [newMatch, setNewMatch] = useState({ p1: "", p2: "", game: "eFootball" });
  const [newPlayer, setNewPlayer] = useState({ name: "", game: "eFootball" });
  const [bonusAmount, setBonusAmount] = useState("");

  const unlock = () => {
    if (pwd === "tomodachi2025") { setUnlocked(true); showNotif("Accès admin accordé ✅"); }
    else showNotif("Mot de passe incorrect", "error");
  };

  const addMatch = () => {
    if (!newMatch.p1.trim() || !newMatch.p2.trim() || newMatch.p1 === newMatch.p2)
      return showNotif("Match invalide", "error");
    setMatches(prev => [...prev, { id: Date.now().toString(), ...newMatch, status: "upcoming", result: null }]);
    setNewMatch({ p1: "", p2: "", game: "eFootball" });
    showNotif("Match ajouté ! ⚔️");
  };

  const resolveMatch = (matchId, winner) => {
    const match = matches.find(m => m.id === matchId);
    const loser = winner === match.p1 ? match.p2 : match.p1;
    const matchBets = bets.filter(b => b.matchId === matchId);
    const winBets = matchBets.filter(b => b.pick === winner);
    const loseBets = matchBets.filter(b => b.pick === loser);
    const pool = loseBets.reduce((s, b) => s + b.amount, 0);
    const totalWin = winBets.reduce((s, b) => s + b.amount, 0);

    let updatedPlayers = [...players];
    winBets.forEach(b => {
      const gain = totalWin > 0 ? Math.floor((b.amount / totalWin) * pool) + b.amount : b.amount;
      updatedPlayers = updatedPlayers.map(p => p.name === b.user ? { ...p, coins: p.coins + gain } : p);
    });

    setPlayers(updatedPlayers);
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: "done", result: winner } : m));
    showNotif(`🏆 ${winner} gagne ! Paris distribués.`);
  };

  const addPlayer = () => {
    if (!newPlayer.name.trim() || players.find(p => p.name === newPlayer.name))
      return showNotif("Joueur invalide ou déjà existant", "error");
    setPlayers(prev => [...prev, { id: Date.now().toString(), ...newPlayer, coins: 1000 }]);
    setNewPlayer({ name: "", game: "eFootball" });
    showNotif(`${newPlayer.name} ajouté avec 1000 TC ! 🎉`);
  };

  const giveBonus = () => {
    const amt = parseInt(bonusAmount);
    if (!amt || amt <= 0) return showNotif("Montant invalide", "error");
    setPlayers(prev => prev.map(p => ({ ...p, coins: p.coins + amt })));
    setBonusAmount("");
    showNotif(`+${amt} TC offerts à tous les joueurs ! 🎁`);
  };

  const deleteMatch = (id) => {
    setMatches(prev => prev.filter(m => m.id !== id));
    setBets(prev => prev.filter(b => b.matchId !== id));
    showNotif("Match supprimé");
  };

  const upcoming = matches.filter(m => m.status === "upcoming");
  const GAMES = ["eFootball", "CoDM", "CoC"];

  if (!unlocked) return (
    <Card>
      <SectionTitle>🔒 ACCÈS ADMIN</SectionTitle>
      <div style={{ textAlign: "center", padding: "10px 0 16px" }}>
        <div style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>Réservé aux administrateurs de Tomodachi E-sport</div>
        <Input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Mot de passe admin" style={{ marginBottom: 10 }} />
        <Btn onClick={unlock}>ENTRER</Btn>
        <div style={{ fontSize: 11, color: T.faint, marginTop: 10 }}>Indice: tomodachi + année actuelle</div>
      </div>
    </Card>
  );

  return (
    <div>
      {/* Add match */}
      <Card>
        <SectionTitle>⚔️ AJOUTER UN MATCH</SectionTitle>
        <div style={{ marginBottom: 8 }}><Label>JOUEUR 1</Label><Input value={newMatch.p1} onChange={e => setNewMatch({ ...newMatch, p1: e.target.value })} placeholder="Nom du joueur 1" /></div>
        <div style={{ marginBottom: 8 }}><Label>JOUEUR 2</Label><Input value={newMatch.p2} onChange={e => setNewMatch({ ...newMatch, p2: e.target.value })} placeholder="Nom du joueur 2" /></div>
        <div style={{ marginBottom: 12 }}><Label>JEU</Label>
          <Select value={newMatch.game} onChange={e => setNewMatch({ ...newMatch, game: e.target.value })}>
            {GAMES.map(g => <option key={g} value={g} style={{ background: "#111118" }}>{gameEmoji(g)} {g}</option>)}
          </Select>
        </div>
        <Btn onClick={addMatch} color={T.cyan}>+ CRÉER LE MATCH</Btn>
      </Card>

      {/* Resolve */}
      {upcoming.length > 0 && (
        <Card>
          <SectionTitle>✅ RÉSOUDRE UN MATCH</SectionTitle>
          {upcoming.map(m => (
            <div key={m.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{m.p1} vs {m.p2}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{gameEmoji(m.game)}</div>
              </div>
              <div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>
                {bets.filter(b => b.matchId === m.id).length} paris · Cagnotte: {bets.filter(b => b.matchId === m.id).reduce((s, b) => s + b.amount, 0)} TC
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.5fr", gap: 6 }}>
                <Btn onClick={() => resolveMatch(m.id, m.p1)} color={T.green} small>🏆 {m.p1}</Btn>
                <Btn onClick={() => resolveMatch(m.id, m.p2)} color={T.green} small>🏆 {m.p2}</Btn>
                <Btn onClick={() => deleteMatch(m.id)} color="#555" small>🗑️</Btn>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Add player */}
      <Card>
        <SectionTitle>👤 AJOUTER UN JOUEUR</SectionTitle>
        <div style={{ marginBottom: 8 }}><Label>PSEUDO</Label><Input value={newPlayer.name} onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })} placeholder="Pseudo du joueur" /></div>
        <div style={{ marginBottom: 12 }}><Label>JEU PRINCIPAL</Label>
          <Select value={newPlayer.game} onChange={e => setNewPlayer({ ...newPlayer, game: e.target.value })}>
            {GAMES.map(g => <option key={g} value={g} style={{ background: "#111118" }}>{gameEmoji(g)} {g}</option>)}
          </Select>
        </div>
        <Btn onClick={addPlayer} color={T.purple}>+ AJOUTER JOUEUR (1000 TC)</Btn>
      </Card>

      {/* Bonus */}
      <Card>
        <SectionTitle>🎁 BONUS POUR TOUS</SectionTitle>
        <div style={{ marginBottom: 12 }}>
          <Label>MONTANT À OFFRIR</Label>
          <Input type="number" value={bonusAmount} onChange={e => setBonusAmount(e.target.value)} placeholder="Ex: 200 TC" />
        </div>
        <Btn onClick={giveBonus} color={T.gold}>🎁 OFFRIR À TOUS LES JOUEURS</Btn>
      </Card>

      {/* Players list */}
      <Card>
        <SectionTitle>👥 JOUEURS ({players.length})</SectionTitle>
        {players.map((p, i) => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < players.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: gameColor(p.game) }}>{gameEmoji(p.game)} {p.game}</div>
            </div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 13, color: T.red, fontWeight: 900 }}>{p.coins.toLocaleString()} TC</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
const INITIAL_PLAYERS = [
  { id: "1", name: "ghostBs", coins: 1000, game: "eFootball" },
  { id: "2", name: "Immortel", coins: 1000, game: "eFootball" },
  { id: "3", name: "GAMEKIONE", coins: 1000, game: "eFootball" },
  { id: "4", name: "Officiel14", coins: 1000, game: "eFootball" },
  { id: "5", name: "Yaya1745", coins: 1000, game: "CoC" },
  { id: "6", name: "S-Optimus", coins: 1000, game: "CoDM" },
];

export default function App() {
  const [players, setPlayers] = useState(INITIAL_PLAYERS);
  const [matches, setMatches] = useState([]);
  const [bets, setBets] = useState([]);
  const [currentUser, setCurrentUser] = useState(INITIAL_PLAYERS[0].name);
  const [notif, setNotif] = useState(null);

  const showNotif = (msg, type = "success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 2800);
  };

  return (
    <AppCtx.Provider value={{ players, setPlayers, matches, setMatches, bets, setBets, currentUser, setCurrentUser, showNotif }}>
      <Router>
        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translate(-50%, -8px); } to { opacity: 1; transform: translate(-50%, 0); } }
          select option { background: #111118 !important; }
          input::placeholder { color: #555; }
          input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        `}</style>

        <Notif msg={notif?.msg} type={notif?.type} />

        <div style={{ background: T.bg, minHeight: "100vh" }}>
          {/* BG glow */}
          <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
            <div style={{ position: "absolute", top: "-15%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(220,38,38,0.1) 0%, transparent 70%)" }} />
            <div style={{ position: "absolute", bottom: "-20%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)" }} />
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <Header currentUser={currentUser} setCurrentUser={setCurrentUser} players={players} />

            <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 90px" }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/matchs" element={<Matchs />} />
                <Route path="/paris" element={<Paris />} />
                <Route path="/classement" element={<Classement />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </div>

            <BottomNav />
          </div>
        </div>
      </Router>
    </AppCtx.Provider>
  );
}
