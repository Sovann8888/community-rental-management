import { useState, useRef, useCallback } from "react";
import { Camera, RefreshCw, CheckCircle, Loader } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { addUsageRecord } from "../../lib/db";

type ScanState = 'idle' | 'scanning' | 'done';
interface MeterCapture { photo: string; reading: string; scanState: ScanState; }
const EMPTY: MeterCapture = { photo: '', reading: '', scanState: 'idle' };

function simulateOCR(onDone: (v: string) => void) {
  const n = Math.floor(Math.random() * 800) + 100;
  setTimeout(() => onDone(String(n).padStart(6, '0')), 1800);
}

function LivePhotoCapture({ label, unit, colorRgb, emoji, capture, onCapture, onReset }: {
  label: string; unit: string; colorRgb: string; emoji: string;
  capture: MeterCapture; onCapture: (url: string) => void; onReset: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { if (ev.target?.result) onCapture(ev.target.result as string); };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [onCapture]);

  const accentColor = `rgb(${colorRgb})`;

  const CornerMarks = () => (
    <>
      {([['0%','0%'],['0%','100%'],['100%','0%'],['100%','100%']] as [string,string][]).map(([t,l], i) => (
        <div key={i} style={{
          position: 'absolute', top: t, left: l, width: '14px', height: '14px',
          borderTop:    t === '0%'   ? `3px solid ${accentColor}` : 'none',
          borderBottom: t === '100%' ? `3px solid ${accentColor}` : 'none',
          borderLeft:   l === '0%'   ? `3px solid ${accentColor}` : 'none',
          borderRight:  l === '100%' ? `3px solid ${accentColor}` : 'none',
          transform: `translate(${l==='100%'?'-100%':'0'},${t==='100%'?'-100%':'0'})`,
        }} />
      ))}
    </>
  );

  return (
    <div className="sr-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `rgba(${colorRgb},0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{emoji}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px' }}>{label}</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Unit: {unit}</div>
        </div>
        {capture.scanState === 'done' && <CheckCircle size={20} color="var(--green)" style={{ marginLeft: 'auto' }} />}
      </div>

      {capture.photo ? (
        <div>
          <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' }}>
            <img src={capture.photo} alt={label} style={{ width: '100%', display: 'block', maxHeight: '220px', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 9999px rgba(0,0,0,0.42)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '72%', height: '36%', border: '2px solid rgba(255,255,255,0.8)', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }}>
              <CornerMarks />
              <div style={{ position: 'absolute', bottom: '4px', right: '7px', fontSize: '9px', color: 'rgba(255,255,255,0.65)', fontFamily: "'DM Mono', monospace" }}>{new Date().toLocaleString()}</div>
            </div>
          </div>

          <div style={{ background: capture.scanState === 'done' ? 'rgba(34,197,94,0.08)' : 'var(--card2)', border: `1px solid ${capture.scanState === 'done' ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`, borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            {capture.scanState === 'scanning' ? (
              <>
                <Loader size={18} color="var(--amber)" style={{ flexShrink: 0, animation: 'spin 1s linear infinite' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--amber)' }}>AI reading meter…</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Detecting digits from photo</div>
                </div>
              </>
            ) : (
              <>
                <CheckCircle size={18} color="var(--green)" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '2px' }}>Reading detected</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '26px', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--white)' }}>{capture.reading}</div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textAlign: 'right' }}>
                  <div>{unit}</div>
                  <div style={{ color: 'var(--green)', marginTop: '2px' }}>✓ Auto-filled</div>
                </div>
              </>
            )}
          </div>

          <button className="sr-btn sr-btn-ghost sr-btn-sm" onClick={onReset} style={{ width: '100%' }}>
            <RefreshCw size={14} /> Retake Photo
          </button>
        </div>
      ) : (
        <div>
          <div onClick={() => fileRef.current?.click()} style={{ position: 'relative', background: '#070b14', borderRadius: '12px', height: '180px', cursor: 'pointer', overflow: 'hidden', border: '2px dashed rgba(255,255,255,0.12)', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '70%', height: '36%', border: '2px solid rgba(255,255,255,0.55)', borderRadius: '6px', position: 'relative', background: 'rgba(255,255,255,0.03)' }}>
                <CornerMarks />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Mono', monospace", fontSize: '20px', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.25em' }}>0 0 0 0 0 0</div>
                <div style={{ position: 'absolute', bottom: '4px', right: '7px', fontSize: '9px', color: 'rgba(255,255,255,0.28)', fontFamily: "'DM Mono', monospace" }}>DATE / TIME</div>
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, textAlign: 'center' }}>
              <Camera size={20} color="rgba(255,255,255,0.55)" style={{ margin: '0 auto 4px' }} />
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Tap to capture</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', marginTop: '1px' }}>Align meter digits inside the box</div>
            </div>
          </div>
          <button className="sr-btn sr-btn-primary" style={{ width: '100%' }} onClick={() => fileRef.current?.click()}>
            <Camera size={16} /> Take Live Photo
          </button>
        </div>
      )}

      <input type="file" accept="image/*" capture="environment" ref={fileRef} onChange={handleFile} style={{ display: 'none' }} />
    </div>
  );
}

export function RenterMeter() {
  const { currentUser } = useAuth();
  const [water, setWater] = useState<MeterCapture>(EMPTY);
  const [electric, setElectric] = useState<MeterCapture>(EMPTY);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (currentUser) {
      addUsageRecord({
        phone: currentUser.phone,
        communityId: currentUser.communityId,
        type: 'water',
        previous: 0,
        current: Number(water.reading) || 0,
      });
      addUsageRecord({
        phone: currentUser.phone,
        communityId: currentUser.communityId,
        type: 'electric',
        previous: 0,
        current: Number(electric.reading) || 0,
      });
    }
    setSubmitted(true);
  };

  const handleCapture = (which: 'water' | 'electric', url: string) => {
    const setter = which === 'water' ? setWater : setElectric;
    setter({ photo: url, reading: '', scanState: 'scanning' });
    simulateOCR(value => setter({ photo: url, reading: value, scanState: 'done' }));
  };

  const bothDone = water.scanState === 'done' && electric.scanState === 'done';

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', gap: '16px', padding: '24px' }}>
        <div style={{ fontSize: '64px' }}>✅</div>
        <div style={{ fontSize: '22px', fontWeight: 700 }}>Reading Submitted!</div>
        <div style={{ color: 'var(--muted)', fontSize: '14px' }}>Your landlord has been notified.</div>
        <div style={{ display: 'flex', gap: '20px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[{ emoji: '💧', label: 'WATER', val: water.reading, unit: 'm³', color: 'var(--sky)' },
            { emoji: '⚡', label: 'ELECTRIC', val: electric.reading, unit: 'kWh', color: 'var(--amber)' }
          ].map(m => (
            <div key={m.label} style={{ background: 'var(--card2)', borderRadius: '14px', padding: '20px 28px', fontFamily: "'DM Mono', monospace" }}>
              <div style={{ fontSize: '11px', color: m.color, marginBottom: '6px' }}>{m.emoji} {m.label}</div>
              <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '0.15em' }}>{m.val}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{m.unit}</div>
            </div>
          ))}
        </div>
        <button className="sr-btn sr-btn-ghost" style={{ marginTop: '8px' }} onClick={() => { setWater(EMPTY); setElectric(EMPTY); setSubmitted(false); }}>Submit another reading</button>
      </div>
    );
  }

  return (
    <>
      <div className="sr-page-header">
        <div>
          <div className="sr-page-title">Submit Meter Reading</div>
          <div className="sr-page-sub">Take a live photo — AI reads the number automatically</div>
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, rgba(26,92,255,0.1) 0%, rgba(10,181,160,0.1) 100%)', border: '1px solid rgba(26,92,255,0.2)', borderRadius: '12px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '22px' }}>📸</div>
        <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--white)' }}>Just take a photo — that's it.</strong>{' '}
          Point your camera at the meter and align the digits inside the box. AI reads the value automatically.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <LivePhotoCapture label="Water Meter" unit="m³" colorRgb="14,165,233" emoji="💧"
          capture={water} onCapture={url => handleCapture('water', url)} onReset={() => setWater(EMPTY)} />
        <LivePhotoCapture label="Electricity Meter" unit="kWh" colorRgb="245,158,11" emoji="⚡"
          capture={electric} onCapture={url => handleCapture('electric', url)} onReset={() => setElectric(EMPTY)} />
      </div>

      <div style={{ maxWidth: '560px' }}>
        {bothDone && (
          <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '12px', fontSize: '13px', color: 'var(--green)' }}>
            ✅ Both meters captured — ready to submit!
          </div>
        )}
        <button className="sr-btn sr-btn-primary" style={{ width: '100%', opacity: bothDone ? 1 : 0.5 }}
          disabled={!bothDone} onClick={handleSubmit}>
          📤 Submit Reading to Landlord
        </button>
        {!bothDone && (
          <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
            {water.scanState === 'idle' && electric.scanState === 'idle' ? 'Capture both meters above to continue'
              : water.scanState !== 'done' ? '💧 Water meter photo still needed'
              : '⚡ Electricity meter photo still needed'}
          </div>
        )}
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
