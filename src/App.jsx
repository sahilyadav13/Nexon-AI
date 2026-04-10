import { useState, useEffect, useRef } from "react";

// ── Design tokens ──────────────────────────────────────────────────────────
const T = {
  bg:      "#0B0C14",
  bgCard:  "#111220",
  bgPanel: "#161728",
  border:  "#1E2035",
  borderHi:"#2D3055",
  purple:  "#7C6FF7",
  purpleD: "#5B55C2",
  teal:    "#2DD4A0",
  tealD:   "#1A9E78",
  amber:   "#F5A623",
  coral:   "#F06060",
  blue:    "#4DA6FF",
  txt:     "#E8E9F4",
  txtMid:  "#9B9DC0",
  txtDim:  "#52547A",
  success: "#2DD4A0",
  warn:    "#F5A623",
  danger:  "#F06060",
};

// ── Utility styles (inline) ─────────────────────────────────────────────────
const S = {
  app: {
    minHeight: "100vh",
    background: T.bg,
    color: T.txt,
    fontFamily: "'Roboto', 'Segoe UI', Arial, sans-serif",
    display: "flex",
  },
  sidebar: {
    width: 220,
    minHeight: "100vh",
    background: T.bgCard,
    borderRight: `1px solid ${T.border}`,
    display: "flex",
    flexDirection: "column",
    padding: "20px 0",
    flexShrink: 0,
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  topbar: {
    height: 56,
    background: T.bgCard,
    borderBottom: `1px solid ${T.border}`,
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    gap: 16,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    padding: 24,
    overflowY: "auto",
  },
  card: {
    background: T.bgCard,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    padding: "20px 22px",
  },
  cardSm: {
    background: T.bgPanel,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: "14px 16px",
  },
  row: { display: "flex", alignItems: "center", gap: 12 },
  col: { display: "flex", flexDirection: "column", gap: 8 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 },
  tag: (color) => ({
    display: "inline-block",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.08em",
    padding: "3px 9px",
    borderRadius: 4,
    background: color + "22",
    color: color,
    border: `1px solid ${color}44`,
    textTransform: "uppercase",
  }),
  btn: (color = T.purple) => ({
    padding: "8px 16px",
    background: color + "18",
    border: `1px solid ${color}55`,
    borderRadius: 7,
    color: color,
    fontSize: 12,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "all 0.15s",
    fontWeight: 600,
    letterSpacing: "0.04em",
  }),
  btnSolid: (color = T.purple) => ({
    padding: "9px 18px",
    background: color,
    border: "none",
    borderRadius: 7,
    color: "#fff",
    fontSize: 12,
    fontFamily: "inherit",
    cursor: "pointer",
    fontWeight: 700,
    letterSpacing: "0.05em",
  }),
  input: {
    background: T.bgPanel,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    color: T.txt,
    fontFamily: "inherit",
    fontSize: 13,
    padding: "10px 14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  label: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: T.txtDim,
    textTransform: "uppercase",
    marginBottom: 6,
    display: "block",
  },
  mono: { fontFamily: "'Roboto', 'Segoe UI', Arial, sans-serif", fontSize: 11 },
};

// ── Tiny components ─────────────────────────────────────────────────────────
const Dot = ({ color, pulse }) => (
  <span style={{
    display: "inline-block", width: 7, height: 7, borderRadius: "50%",
    background: color,
    boxShadow: pulse ? `0 0 0 3px ${color}33` : "none",
    flexShrink: 0,
  }} />
);

const Pill = ({ label, color = T.purple }) => (
  <span style={S.tag(color)}>{label}</span>
);

const Metric = ({ label, value, color = T.purple, sub }) => (
  <div style={{ ...S.cardSm, textAlign: "center" }}>
    <div style={{ fontSize: 10, color: T.txtDim, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 10, color: T.txtMid, marginTop: 4 }}>{sub}</div>}
  </div>
);

const BarFill = ({ pct, color = T.purple, height = 4 }) => (
  <div style={{ background: T.border, borderRadius: height, height, overflow: "hidden", width: "100%" }}>
    <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: height, transition: "width 0.6s ease" }} />
  </div>
);

const SectionTitle = ({ children, accent = T.purple }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
    <div style={{ width: 3, height: 16, background: accent, borderRadius: 2 }} />
    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.txtMid }}>{children}</span>
  </div>
);

// ── Gauge Ring ───────────────────────────────────────────────────────────────
const GaugeRing = ({ value, size = 80, color = T.teal, label }) => {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const offset = circ - (pct / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
        <text x={size/2} y={size/2 + 5} textAnchor="middle" fill={color}
          fontSize={14} fontWeight={700} fontFamily="inherit">{pct}</text>
      </svg>
      {label && <div style={{ fontSize: 10, color: T.txtDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>}
    </div>
  );
};

// ── SHAP Bar ─────────────────────────────────────────────────────────────────
const SHAPBar = ({ feature, value, max }) => {
  const pos = value >= 0;
  const pct = Math.abs(value) / max * 100;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "center", gap: 10, marginBottom: 6 }}>
      <div style={{ fontSize: 11, color: T.txtMid, textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{feature}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {!pos && <div style={{ marginLeft: `${50 - pct/2}%`, width: `${pct/2}%`, minWidth: 2, height: 16, background: T.coral, borderRadius: "2px 0 0 2px", transition: "all 0.5s" }} />}
        <div style={{ width: 1, height: 20, background: T.border, flexShrink: 0 }} />
        {pos && <div style={{ width: `${pct/2}%`, minWidth: 2, height: 16, background: T.teal, borderRadius: "0 2px 2px 0", transition: "all 0.5s" }} />}
        <span style={{ fontSize: 10, color: pos ? T.teal : T.coral, fontWeight: 600, flexShrink: 0 }}>{pos ? "+" : ""}{value.toFixed(3)}</span>
      </div>
    </div>
  );
};

// ── Nav items ────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard",       label: "Dashboard",       icon: "◈" },
  { id: "chat",            label: "AI Chat",         icon: "◎" },
  { id: "explainability",  label: "Explainability",  icon: "◬" },
  { id: "ethics",          label: "Ethics Guard",    icon: "◉" },
  { id: "audit",           label: "Audit Log",       icon: "▤" },
  { id: "visualizer",      label: "Live Visualizer", icon: "◫" },
  { id: "userprofile",     label: "Trust Profile",   icon: "◌" },
  { id: "admin",           label: "Admin Console",   icon: "◧" },
];

const NAV_COLORS = {
  dashboard: T.purple, chat: T.teal, explainability: T.blue,
  ethics: T.amber, audit: T.coral, visualizer: T.teal,
  userprofile: T.purple, admin: T.txtMid,
};

// ── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_MESSAGES = [
  { id: 1, role: "user", text: "Explain the decision to deny the loan application for customer #4821.", ts: "14:32" },
  {
    id: 2, role: "ai",
    text: "The loan application for customer #4821 was denied based on three primary factors: debt-to-income ratio of 0.72 (threshold: 0.45), recent 60-day delinquency in Q3 2024, and credit utilization above 89%. The model confidence is 94.2%.",
    ts: "14:32", confidence: 94, ethics: { score: 88, flags: [] }, citations: ["Credit Bureau API", "Internal Risk Model v2.4"],
  },
  { id: 3, role: "user", text: "Are there any potential bias concerns with this decision?", ts: "14:33" },
  {
    id: 4, role: "ai",
    text: "Fairness analysis shows the denial rate for this demographic group is within 3.2% of the baseline, which is within acceptable bounds. However, the debt-to-income feature has shown a 6.1% higher weighting for applicants in ZIP codes with median income < $45K — flagged for review.",
    ts: "14:33", confidence: 87, ethics: { score: 71, flags: ["income_proxy"] }, citations: ["Fairness Monitor v1.8"],
  },
];

const SHAP_DATA = [
  { feature: "Debt-to-income ratio",  value: 0.412 },
  { feature: "Delinquency history",   value: 0.287 },
  { feature: "Credit utilization",    value: 0.201 },
  { feature: "Employment duration",   value: -0.089 },
  { feature: "Account age",           value: -0.063 },
  { feature: "Inquiry count (6mo)",   value: 0.044 },
];

const AUDIT_ROWS = [
  { id: "AUD-0041", ts: "14:33:12", user: "analyst@bank.com", action: "AI response generated", model: "v2.4", ethics: 71, hash: "a4f9c3...", status: "flagged" },
  { id: "AUD-0040", ts: "14:32:55", user: "analyst@bank.com", action: "Query submitted",        model: "v2.4", ethics: 95, hash: "7bc12e...", status: "ok" },
  { id: "AUD-0039", ts: "14:28:03", user: "admin@bank.com",   action: "Model version switched", model: "v2.3→v2.4", ethics: "—", hash: "3de90a...", status: "ok" },
  { id: "AUD-0038", ts: "14:15:44", user: "analyst@bank.com", action: "Ethics override applied",model: "v2.3", ethics: 58, hash: "f10c7b...", status: "warn" },
];

const BIAS_GROUPS = [
  { group: "Gender",        score: 96, delta: "+0.3%", status: "pass" },
  { group: "Age (18–30)",   score: 78, delta: "+4.8%", status: "warn" },
  { group: "ZIP income",    score: 69, delta: "+6.1%", status: "warn" },
  { group: "Ethnicity",     score: 91, delta: "+1.2%", status: "pass" },
];

// ── PAGES ────────────────────────────────────────────────────────────────────

function Dashboard() {
  const [confidence] = useState(91);
  return (
    <div style={S.col}>
      <SectionTitle accent={T.purple}>System overview</SectionTitle>
      <div style={S.grid4}>
        <Metric label="Ethics Score"   value="88" color={T.teal}   sub="Last 100 responses" />
        <Metric label="Avg Confidence" value="91%" color={T.purple} sub="Session average" />
        <Metric label="Flags Today"    value="3"   color={T.amber}  sub="2 warn, 1 block" />
        <Metric label="Audit Entries"  value="41"  color={T.blue}   sub="All verified ✓" />
      </div>

      <div style={S.grid2}>
        <div style={S.card}>
          <SectionTitle accent={T.teal}>Fairness gauges</SectionTitle>
          <div style={{ display: "flex", justifyContent: "space-around", paddingTop: 8 }}>
            <GaugeRing value={94} color={T.teal}   label="Dem. Parity" />
            <GaugeRing value={88} color={T.purple} label="Eq. Odds" />
            <GaugeRing value={76} color={T.amber}  label="Ind. Fairness" />
          </div>
        </div>

        <div style={S.card}>
          <SectionTitle accent={T.blue}>Confidence trend</SectionTitle>
          {[88, 91, 87, 94, 90, 93, 91].map((v, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
              <div style={{ width: 36, fontSize: 10, color: T.txtDim }}>T-{6 - i}</div>
              <BarFill pct={v} color={v >= 90 ? T.teal : T.amber} />
              <div style={{ width: 30, fontSize: 10, color: T.txtMid, textAlign: "right" }}>{v}%</div>
            </div>
          ))}
        </div>
      </div>

      <div style={S.card}>
        <SectionTitle accent={T.amber}>Active ethics flags</SectionTitle>
        {[
          { type: "income_proxy", msg: "ZIP code used as income proxy in feature importance", sev: "warn" },
          { type: "age_disparity", msg: "Age group 18-30 shows 4.8% higher denial rate", sev: "warn" },
        ].map((f, i) => (
          <div key={i} style={{ ...S.cardSm, display: "flex", alignItems: "center", gap: 12, marginBottom: 8, borderLeft: `3px solid ${f.sev === "warn" ? T.amber : T.coral}`, borderRadius: "0 8px 8px 0" }}>
            <Dot color={f.sev === "warn" ? T.amber : T.coral} pulse />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.txt, marginBottom: 2 }}>{f.type}</div>
              <div style={{ fontSize: 11, color: T.txtMid }}>{f.msg}</div>
            </div>
            <Pill label={f.sev} color={f.sev === "warn" ? T.amber : T.coral} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatPage() {
  const [msgs, setMsgs] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [showXAI, setShowXAI] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), role: "user", text: input, ts: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }) };
    setMsgs((m) => [...m, userMsg]);
    setInput("");
    setStreaming(true);
    setTimeout(() => {
      setMsgs((m) => [...m, {
        id: Date.now() + 1, role: "ai",
        text: "Analyzing your query using the ethical risk framework... The model has identified 2 relevant features with high importance scores. No significant bias flags detected for this query.",
        ts: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
        confidence: 89, ethics: { score: 92, flags: [] }, citations: ["Internal Model v2.4"],
      }]);
      setStreaming(false);
    }, 1400);
  };

  return (
    <div style={{ display: "flex", gap: 16, height: "calc(100vh - 104px)" }}>
      <div style={{ flex: 1, ...S.card, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <SectionTitle accent={T.teal}>Conversation</SectionTitle>
        <div style={{ flex: 1, overflowY: "auto", paddingRight: 4, marginBottom: 14 }}>
          {msgs.map((m) => (
            <div key={m.id} style={{ marginBottom: 16, display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 10, color: T.txtDim }}>{m.ts}</span>
                {m.role === "ai" && m.confidence && (
                  <span style={S.tag(m.confidence >= 90 ? T.teal : T.amber)}>{m.confidence}% conf</span>
                )}
                {m.role === "ai" && m.ethics && (
                  <span style={S.tag(m.ethics.score >= 85 ? T.teal : m.ethics.score >= 70 ? T.amber : T.coral)}>
                    ethics {m.ethics.score}
                  </span>
                )}
              </div>
              <div style={{
                maxWidth: "82%",
                background: m.role === "user" ? T.purple + "22" : T.bgPanel,
                border: `1px solid ${m.role === "user" ? T.purple + "44" : T.border}`,
                borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                padding: "12px 14px",
                fontSize: 13,
                lineHeight: 1.6,
                color: T.txt,
              }}>{m.text}</div>
              {m.role === "ai" && (
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  {m.citations?.map((c, i) => <Pill key={i} label={c} color={T.blue} />)}
                  <button style={S.btn(T.purple)} onClick={() => setShowXAI(true)}>Explain ↗</button>
                </div>
              )}
            </div>
          ))}
          {streaming && (
            <div style={{ ...S.cardSm, display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, color: T.teal }}>
              <span>Generating</span>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: T.teal, animation: `pulse 1s ${i * 0.2}s infinite`, display: "inline-block" }} />
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask the AI assistant... (Enter to send)"
            rows={2}
            style={{ ...S.input, resize: "none", flex: 1 }}
          />
          <button style={S.btnSolid(T.teal)} onClick={send}>Send</button>
        </div>
      </div>

      {showXAI && (
        <div style={{ width: 300, ...S.card, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <SectionTitle accent={T.blue}>Explanation</SectionTitle>
            <button style={{ background: "none", border: "none", color: T.txtDim, cursor: "pointer", fontSize: 16 }} onClick={() => setShowXAI(false)}>x</button>
          </div>
          <div style={S.cardSm}>
            <div style={S.label}>Plain language</div>
            <div style={{ fontSize: 12, color: T.txtMid, lineHeight: 1.6 }}>
              The AI denied the application primarily because the debt load relative to income was too high (41% of the decision weight), combined with a recent missed payment.
            </div>
          </div>
          <div>
            <div style={S.label}>SHAP feature contributions</div>
            {SHAP_DATA.map((d, i) => <SHAPBar key={i} {...d} max={0.45} />)}
          </div>
          <div style={S.cardSm}>
            <div style={S.label}>Decision confidence</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <GaugeRing value={94} size={60} color={T.teal} />
              <div style={{ fontSize: 11, color: T.txtMid, lineHeight: 1.6 }}>High confidence. Faithfulness: 96. Completeness: 91. Stability: 88.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExplainabilityPage() {
  const [tab, setTab] = useState("shap");
  const tabs = ["shap", "attention", "lime", "counterfactual", "trace"];
  return (
    <div style={S.col}>
      <SectionTitle accent={T.blue}>Explainability panel</SectionTitle>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            ...S.btn(tab === t ? T.blue : T.txtDim),
            background: tab === t ? T.blue + "22" : "transparent",
            borderColor: tab === t ? T.blue + "66" : T.border,
            color: tab === t ? T.blue : T.txtDim,
          }}>{t.toUpperCase()}</button>
        ))}
      </div>

      {tab === "shap" && (
        <div style={S.card}>
          <div style={S.label}>SHAP waterfall - feature contributions to denial decision</div>
          <div style={{ marginTop: 16 }}>
            {SHAP_DATA.map((d, i) => <SHAPBar key={i} {...d} max={0.45} />)}
          </div>
          <div style={{ marginTop: 12, padding: "10px 12px", background: T.bgPanel, borderRadius: 6, fontSize: 11, color: T.txtMid }}>
            Baseline prediction: 0.31 to Final: 0.89 (DENY). Positive values push toward denial, negative toward approval.
          </div>
        </div>
      )}

      {tab === "attention" && (
        <div style={S.card}>
          <div style={S.label}>Attention heatmap - token importance in input</div>
          <div style={{ marginTop: 12, lineHeight: 2.2, fontSize: 14 }}>
            {[
              ["The", 0.05], ["loan", 0.32], ["application", 0.28], ["for", 0.02],
              ["customer", 0.15], ["#4821", 0.61], ["was", 0.03], ["denied", 0.88],
              ["based", 0.12], ["on", 0.02], ["debt-to-income", 0.95], ["ratio", 0.77],
              ["of", 0.04], ["0.72", 0.99], ["(threshold:", 0.41], ["0.45)", 0.85],
            ].map(([word, w], i) => (
              <span key={i} style={{
                display: "inline-block",
                background: `rgba(77, 166, 255, ${w * 0.6})`,
                borderRadius: 4,
                padding: "2px 5px",
                marginRight: 4,
                color: w > 0.5 ? T.txt : T.txtMid,
                fontSize: 13,
              }}>{word}</span>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: T.txtMid }}>Token color intensity = attention weight. Darker = higher model focus.</div>
        </div>
      )}

      {tab === "lime" && (
        <div style={S.card}>
          <div style={S.label}>LIME local explanation - perturbed neighborhood</div>
          {SHAP_DATA.map((d, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "150px 1fr 60px", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: T.txtMid }}>{d.feature}</div>
              <BarFill pct={Math.abs(d.value) / 0.45 * 100} color={d.value >= 0 ? T.coral : T.teal} height={8} />
              <div style={{ fontSize: 11, color: d.value >= 0 ? T.coral : T.teal, textAlign: "right", fontWeight: 600 }}>
                {d.value >= 0 ? "-" : "+"}{Math.abs(d.value).toFixed(3)}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "counterfactual" && (
        <div style={S.card}>
          <div style={S.label}>Counterfactual explorer - minimum change to flip decision</div>
          <div style={S.cardSm}>
            <div style={{ fontSize: 12, color: T.amber, marginBottom: 10 }}>
              Minimum change needed to approve this application:
            </div>
            {[
              ["Debt-to-income ratio", "0.72", "0.44", T.teal],
              ["Credit utilization", "89%", "72%", T.teal],
              ["Delinquency flag", "Yes (Q3 2024)", "No", T.teal],
            ].map(([field, from, to, color], i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8, fontSize: 12 }}>
                <span style={{ flex: 1, color: T.txtMid }}>{field}</span>
                <span style={{ color: T.coral }}>{from}</span>
                <span style={{ color: T.txtDim }}>{"->"}</span>
                <span style={{ color }}>{to}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: T.txtDim }}>
            Probability of approval after changes: <span style={{ color: T.teal }}>73.2%</span>
          </div>
        </div>
      )}

      {tab === "trace" && (
        <div style={S.card}>
          <div style={S.label}>Decision trace - step-by-step reasoning</div>
          {[
            { step: 1, name: "Input validation",     conf: 100, out: "Valid - 6 features extracted" },
            { step: 2, name: "Feature scaling",      conf: 100, out: "Normalized to [0,1] range" },
            { step: 3, name: "Risk model inference", conf: 94,  out: "Risk score: 0.89 (HIGH)" },
            { step: 4, name: "Ethics check",         conf: 88,  out: "1 proxy flag detected (ZIP)" },
            { step: 5, name: "Decision threshold",   conf: 94,  out: "0.89 > 0.45 -> DENY" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 14, marginBottom: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: T.purple + "33", border: `1px solid ${T.purple}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: T.purple, fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
                {i < 4 && <div style={{ width: 1, flex: 1, background: T.border, margin: "3px 0" }} />}
              </div>
              <div style={{ flex: 1, paddingBottom: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.txt }}>{s.name}</span>
                  <Pill label={`${s.conf}%`} color={s.conf >= 95 ? T.teal : T.amber} />
                </div>
                <div style={{ fontSize: 11, color: T.txtMid }}>{s.out}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EthicsPage() {
  return (
    <div style={S.col}>
      <SectionTitle accent={T.amber}>Ethics guard - bias & fairness analysis</SectionTitle>
      <div style={S.grid4}>
        <Metric label="Overall Score"   value="82"  color={T.amber}  sub="Session average" />
        <Metric label="Flags Triggered" value="3"   color={T.coral}  sub="2 warn, 1 block" />
        <Metric label="Groups Tested"   value="4"   color={T.blue}   sub="All groups" />
        <Metric label="Compliance"      value="EU AI" color={T.teal} sub="Art. 10/13 ✓" />
      </div>

      <div style={S.card}>
        <SectionTitle accent={T.amber}>Bias scorecard - demographic groups</SectionTitle>
        {BIAS_GROUPS.map((g, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 1fr 80px 80px", gap: 12, alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: T.txt }}>{g.group}</div>
            <BarFill pct={g.score} color={g.status === "pass" ? T.teal : T.amber} height={6} />
            <div style={{ fontSize: 11, color: T.txtMid, textAlign: "center" }}>{g.delta}</div>
            <Pill label={g.status} color={g.status === "pass" ? T.teal : T.amber} />
          </div>
        ))}
      </div>

      <div style={S.grid2}>
        <div style={S.card}>
          <SectionTitle accent={T.blue}>Fairness metrics</SectionTitle>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <GaugeRing value={94} color={T.teal}   label="Dem. Parity" />
            <GaugeRing value={88} color={T.purple} label="Eq. Odds" />
            <GaugeRing value={76} color={T.amber}  label="Ind. Fair." />
          </div>
        </div>
        <div style={S.card}>
          <SectionTitle accent={T.coral}>Mitigation actions</SectionTitle>
          {[
            { action: "Remove ZIP code from feature set",   effort: "Low",  impact: "High" },
            { action: "Increase age group 18-30 sample",   effort: "Med",  impact: "Med" },
            { action: "Re-calibrate income threshold",     effort: "High", impact: "High" },
          ].map((a, i) => (
            <div key={i} style={{ ...S.cardSm, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 11, color: T.txtMid, flex: 1 }}>{a.action}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <Pill label={a.effort} color={a.effort === "Low" ? T.teal : a.effort === "Med" ? T.amber : T.coral} />
                <Pill label={`↑ ${a.impact}`} color={T.blue} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={S.card}>
        <SectionTitle accent={T.teal}>Compliance badges</SectionTitle>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { label: "GDPR Art. 22", status: "pass" },
            { label: "EU AI Act Art. 10", status: "pass" },
            { label: "EU AI Act Art. 13", status: "warn" },
            { label: "ISO 42001", status: "pass" },
            { label: "CCPA", status: "pass" },
          ].map((c, i) => (
            <div key={i} style={{ ...S.cardSm, display: "flex", alignItems: "center", gap: 8 }}>
              <Dot color={c.status === "pass" ? T.teal : T.amber} pulse={c.status !== "pass"} />
              <span style={{ fontSize: 11, fontWeight: 600, color: T.txt }}>{c.label}</span>
              <Pill label={c.status} color={c.status === "pass" ? T.teal : T.amber} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuditPage() {
  const [selected, setSelected] = useState(null);
  return (
    <div style={S.col}>
      <SectionTitle accent={T.coral}>Audit & compliance log</SectionTitle>
      <div style={S.grid4}>
        <Metric label="Total Entries" value="41"    color={T.blue}  sub="All sessions" />
        <Metric label="Chain Valid"   value="100%"  color={T.teal}  sub="SHA-256 ✓" />
        <Metric label="Flagged"       value="3"     color={T.amber} sub="Pending review" />
        <Metric label="Exported"      value="12"    color={T.txtMid} sub="This month" />
      </div>

      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <SectionTitle accent={T.coral}>Decision log</SectionTitle>
          <button style={S.btn(T.coral)}>Export CSV ↓</button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {["Entry ID", "Timestamp", "User", "Action", "Model", "Ethics", "Hash", "Status"].map((h) => (
                  <th key={h} style={{ padding: "8px 10px", color: T.txtDim, fontWeight: 700, letterSpacing: "0.08em", textAlign: "left", whiteSpace: "nowrap" }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AUDIT_ROWS.map((r, i) => (
                <tr key={i} onClick={() => setSelected(i === selected ? null : i)}
                  style={{ borderBottom: `1px solid ${T.border}`, cursor: "pointer", background: selected === i ? T.purple + "11" : "transparent", transition: "background 0.15s" }}>
                  <td style={{ padding: "10px 10px", color: T.blue, fontWeight: 600 }}>{r.id}</td>
                  <td style={{ padding: "10px 10px", color: T.txtMid }}>{r.ts}</td>
                  <td style={{ padding: "10px 10px", color: T.txt }}>{r.user}</td>
                  <td style={{ padding: "10px 10px", color: T.txt }}>{r.action}</td>
                  <td style={{ padding: "10px 10px", color: T.txtMid }}>{r.model}</td>
                  <td style={{ padding: "10px 10px", color: typeof r.ethics === "number" ? (r.ethics >= 85 ? T.teal : T.amber) : T.txtDim }}>{r.ethics}</td>
                  <td style={{ padding: "10px 10px", ...S.mono, color: T.txtDim }}>{r.hash}</td>
                  <td style={{ padding: "10px 10px" }}>
                    <Pill label={r.status} color={r.status === "ok" ? T.teal : r.status === "warn" ? T.amber : T.coral} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selected !== null && (
          <div style={{ ...S.cardSm, marginTop: 12, borderLeft: `3px solid ${T.blue}`, borderRadius: "0 8px 8px 0" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.blue, marginBottom: 6 }}>Entry detail - {AUDIT_ROWS[selected].id}</div>
            <div style={{ ...S.mono, color: T.txtMid, lineHeight: 1.8 }}>
              Hash: <span style={{ color: T.teal }}>{AUDIT_ROWS[selected].hash}a1b2c3d4e5f6</span><br />
              Chain verified: <span style={{ color: T.teal }}>✓ VALID</span><br />
              User: {AUDIT_ROWS[selected].user}<br />
              Action: {AUDIT_ROWS[selected].action}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VisualizerPage() {
  const [threshold, setThreshold] = useState(70);
  const [conf, setConf] = useState([82, 87, 91, 88, 94, 90, 93, 87, 91, 95, 89, 92]);

  useEffect(() => {
    const id = setInterval(() => {
      setConf((c) => [...c.slice(1), Math.round(82 + Math.random() * 16)]);
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const maxC = Math.max(...conf);
  return (
    <div style={S.col}>
      <SectionTitle accent={T.teal}>Live visualizer</SectionTitle>
      <div style={S.grid2}>
        <div style={S.card}>
          <SectionTitle accent={T.teal}>Confidence stream (live)</SectionTitle>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 100 }}>
            {conf.map((v, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{ width: "100%", height: v / maxC * 90, background: v >= threshold ? T.teal : T.amber, borderRadius: "3px 3px 0 0", transition: "height 0.5s ease, background 0.3s" }} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: T.txtMid }}>
            <span>Threshold</span>
            <input type="range" min={50} max={99} value={threshold} step={1}
              onChange={(e) => setThreshold(Number(e.target.value))}
              style={{ flex: 1, accentColor: T.teal }} />
            <span style={{ color: T.teal, fontWeight: 700, width: 32, textAlign: "right" }}>{threshold}%</span>
          </div>
        </div>

        <div style={S.card}>
          <SectionTitle accent={T.purple}>Probability distribution</SectionTitle>
          {[
            ["DENY",    0.89, T.coral],
            ["APPROVE", 0.08, T.teal],
            ["REVIEW",  0.03, T.amber],
          ].map(([label, prob, color], i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "70px 1fr 50px", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: T.txt, fontWeight: 600 }}>{label}</div>
              <BarFill pct={prob * 100} color={color} height={12} />
              <div style={{ fontSize: 12, color, textAlign: "right", fontWeight: 700 }}>{(prob * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </div>

      <div style={S.grid2}>
        <div style={S.card}>
          <SectionTitle accent={T.blue}>Feature importance heatmap</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
            {SHAP_DATA.map((d, i) => (
              <div key={i} style={{
                ...S.cardSm,
                background: `rgba(124, 111, 247, ${Math.abs(d.value) / 0.45 * 0.7})`,
                borderColor: T.purple + "44",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 9, color: T.txtMid, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{d.feature.split(" ")[0]}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.txt }}>{Math.abs(d.value).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={S.card}>
          <SectionTitle accent={T.amber}>Model comparison</SectionTitle>
          {[
            ["Accuracy",    91, 89],
            ["Fairness",    82, 76],
            ["Calibration", 88, 85],
            ["Robustness",  79, 83],
            ["Latency (ms)", 120, 185],
          ].map(([metric, v2_4, v2_3], i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1fr 40px 1fr 40px", gap: 6, alignItems: "center", marginBottom: 8, fontSize: 11 }}>
              <div style={{ color: T.txtMid }}>{metric}</div>
              <BarFill pct={typeof v2_4 === "number" && metric !== "Latency (ms)" ? v2_4 : 100 - v2_4 / 200 * 100} color={T.teal} height={6} />
              <div style={{ color: T.teal, textAlign: "right", fontWeight: 600, fontSize: 10 }}>{v2_4}</div>
              <BarFill pct={typeof v2_3 === "number" && metric !== "Latency (ms)" ? v2_3 : 100 - v2_3 / 200 * 100} color={T.purple} height={6} />
              <div style={{ color: T.purple, textAlign: "right", fontWeight: 600, fontSize: 10 }}>{v2_3}</div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 10 }}>
            <span style={{ color: T.teal }}>■ v2.4 (current)</span>
            <span style={{ color: T.purple }}>■ v2.3 (prev)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserProfilePage() {
  const [depth, setDepth] = useState("intermediate");
  const [consents, setConsents] = useState({ analytics: true, training: false, sharing: false, personalisation: true });
  return (
    <div style={S.col}>
      <SectionTitle accent={T.purple}>User trust profile</SectionTitle>
      <div style={S.grid4}>
        <Metric label="Trust Score"    value="86" color={T.teal}   sub="Composite" />
        <Metric label="Sessions"       value="24" color={T.purple} sub="Last 30 days" />
        <Metric label="Feedback Rate"  value="79%" color={T.blue}  sub="Responses rated" />
        <Metric label="Ethics Agree"   value="94%" color={T.teal}  sub="Alignment score" />
      </div>

      <div style={S.grid2}>
        <div style={S.card}>
          <SectionTitle accent={T.teal}>Consent management</SectionTitle>
          {Object.entries(consents).map(([key, val]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, padding: "10px 12px", background: T.bgPanel, borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.txt, textTransform: "capitalize" }}>{key.replace(/([A-Z])/g, " $1")}</div>
                <div style={{ fontSize: 10, color: T.txtDim, marginTop: 2 }}>GDPR legal basis: Legitimate interest</div>
              </div>
              <div
                onClick={() => setConsents((c) => ({ ...c, [key]: !c[key] }))}
                style={{ width: 36, height: 20, borderRadius: 10, background: val ? T.teal : T.border, cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 3, left: val ? 19 : 3, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
              </div>
            </div>
          ))}
        </div>

        <div style={S.card}>
          <SectionTitle accent={T.blue}>Explanation depth</SectionTitle>
          {[
            { key: "novice",        label: "Novice",      desc: "Plain English summaries only" },
            { key: "intermediate",  label: "Intermediate", desc: "Key factors + confidence" },
            { key: "expert",        label: "Expert",      desc: "Full SHAP + attention traces" },
            { key: "developer",     label: "Developer",   desc: "Raw JSON + API response" },
          ].map((opt) => (
            <div key={opt.key} onClick={() => setDepth(opt.key)} style={{
              ...S.cardSm,
              marginBottom: 8,
              cursor: "pointer",
              borderColor: depth === opt.key ? T.purple + "88" : T.border,
              background: depth === opt.key ? T.purple + "11" : T.bgPanel,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: depth === opt.key ? T.purple : T.border, transition: "background 0.15s", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.txt }}>{opt.label}</div>
                <div style={{ fontSize: 10, color: T.txtMid }}>{opt.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminPage() {
  const [ethics, setEthics] = useState({ fairness: 70, bias: 15, confidence: 80, strictness: 60 });
  return (
    <div style={S.col}>
      <SectionTitle accent={T.txtMid}>Admin console</SectionTitle>
      <div style={S.grid4}>
        <Metric label="API Latency"  value="142ms" color={T.teal}  sub="P95 last hour" />
        <Metric label="Error Rate"   value="0.3%"  color={T.teal}  sub="Last 1000 req" />
        <Metric label="Active Users" value="7"     color={T.blue}  sub="Live sessions" />
        <Metric label="Model"        value="v2.4"  color={T.purple} sub="Deployed 2d ago" />
      </div>

      <div style={S.grid2}>
        <div style={S.card}>
          <SectionTitle accent={T.amber}>Ethics threshold tuner</SectionTitle>
          {Object.entries(ethics).map(([key, val]) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ ...S.label, margin: 0 }}>{key.replace(/([A-Z])/g, " $1")}</span>
                <span style={{ fontSize: 12, color: T.amber, fontWeight: 700 }}>{val}</span>
              </div>
              <input type="range" min={0} max={100} value={val} step={1}
                onChange={(e) => setEthics((e2) => ({ ...e2, [key]: Number(e.target.value) }))}
                style={{ width: "100%", accentColor: T.amber }} />
              <div style={{ fontSize: 10, color: T.txtDim, marginTop: 3 }}>
                At {val}: ~{Math.round(val * 0.4 + 10)}% of responses would be flagged
              </div>
            </div>
          ))}
        </div>

        <div style={S.card}>
          <SectionTitle accent={T.blue}>Model version manager</SectionTitle>
          {[
            { ver: "v2.4", date: "Apr 08 2026", acc: 91, fair: 82, status: "active" },
            { ver: "v2.3", date: "Mar 15 2026", acc: 89, fair: 76, status: "archived" },
            { ver: "v2.2", date: "Feb 01 2026", acc: 87, fair: 71, status: "archived" },
          ].map((m, i) => (
            <div key={i} style={{ ...S.cardSm, marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.txt }}>{m.ver}</span>
                  <Pill label={m.status} color={m.status === "active" ? T.teal : T.txtDim} />
                </div>
                <div style={{ fontSize: 10, color: T.txtDim }}>{m.date} · Acc {m.acc}% · Fairness {m.fair}</div>
              </div>
              {m.status !== "active" && (
                <button style={S.btn(T.blue)}>Rollback</button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={S.card}>
        <SectionTitle accent={T.purple}>RBAC permission matrix</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                <th style={{ padding: "8px 10px", color: T.txtDim, textAlign: "left" }}>PERMISSION</th>
                {["Super Admin", "Admin", "Analyst", "User", "Auditor"].map((r) => (
                  <th key={r} style={{ padding: "8px 10px", color: T.txtDim, textAlign: "center" }}>{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Read audit logs",    [1, 1, 1, 0, 1]],
                ["Export data",        [1, 1, 1, 0, 1]],
                ["Configure ethics",   [1, 1, 0, 0, 0]],
                ["Manage models",      [1, 1, 0, 0, 0]],
                ["View explanations",  [1, 1, 1, 1, 1]],
                ["Override decisions", [1, 0, 0, 0, 0]],
              ].map(([perm, grants], i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: "9px 10px", color: T.txtMid }}>{perm}</td>
                  {grants.map((g, j) => (
                    <td key={j} style={{ padding: "9px 10px", textAlign: "center" }}>
                      <span style={{ color: g ? T.teal : T.border, fontSize: 14 }}>{g ? "✓" : "-"}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [notifications] = useState(3);

  const PAGES = {
    dashboard:     <Dashboard />,
    chat:          <ChatPage />,
    explainability: <ExplainabilityPage />,
    ethics:        <EthicsPage />,
    audit:         <AuditPage />,
    visualizer:    <VisualizerPage />,
    userprofile:   <UserProfilePage />,
    admin:         <AdminPage />,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1E2035; border-radius: 3px; }
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.1)} }
        input[type=range] { height: 18px; }
      `}</style>
      <div style={S.app}>
        {/* Sidebar */}
        <div style={S.sidebar}>
          <div style={{ padding: "0 20px 20px", borderBottom: `1px solid ${T.border}`, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.purple, letterSpacing: "0.08em" }}>◈ ETHICAL XAI</div>
            <div style={{ fontSize: 9, color: T.txtDim, letterSpacing: "0.14em", marginTop: 2 }}>ASSISTANT v2.4</div>
          </div>
          {NAV.map((n) => {
            const active = page === n.id;
            const color = NAV_COLORS[n.id];
            return (
              <button key={n.id} onClick={() => setPage(n.id)} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 20px",
                background: active ? color + "18" : "transparent",
                border: "none",
                borderLeft: `3px solid ${active ? color : "transparent"}`,
                color: active ? color : T.txtDim,
                fontSize: 12, fontFamily: "inherit", fontWeight: active ? 700 : 400,
                cursor: "pointer", width: "100%", textAlign: "left",
                transition: "all 0.12s",
                letterSpacing: "0.04em",
              }}>
                <span style={{ fontSize: 14, opacity: active ? 1 : 0.6 }}>{n.icon}</span>
                {n.label}
                {n.id === "ethics" && <span style={{ marginLeft: "auto", ...S.tag(T.amber), padding: "1px 6px" }}>2</span>}
              </button>
            );
          })}

          <div style={{ marginTop: "auto", padding: "16px 20px", borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.purple + "33", border: `1px solid ${T.purple}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: T.purple, fontWeight: 700 }}>SA</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.txt }}>analyst@bank.com</div>
                <div style={{ fontSize: 9, color: T.txtDim }}>Analyst role</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={S.main}>
          <div style={S.topbar}>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: T.txt, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {NAV.find((n) => n.id === page)?.label}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.bgPanel, border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 12px" }}>
              <span style={{ fontSize: 11, color: T.txtDim }}>⌘K</span>
              <span style={{ fontSize: 11, color: T.txtDim }}>Search</span>
            </div>
            <div style={{ position: "relative" }}>
              <button style={{ ...S.btn(T.amber), padding: "7px 12px" }}>◎ {notifications}</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Dot color={T.teal} pulse />
              <span style={{ fontSize: 11, color: T.teal, fontWeight: 600 }}>LIVE</span>
            </div>
          </div>
          <div style={S.content}>
            {PAGES[page]}
          </div>
        </div>
      </div>
    </>
  );
}
