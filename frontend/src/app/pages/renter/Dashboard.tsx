import { useState } from "react";
import { Droplet, Zap, Wallet, AlertCircle, Phone, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getRooms } from "../../lib/db";

type RenterViewData = {
  name: string; initials: string; phone: string; room: string; community: string;
  rent: number;
  water: { previous: number; current: number; rate: number };
  electric: { previous: number; current: number; rate: number };
  dueDate: string;
};

const EMPTY_RENTER_DATA: RenterViewData = {
  name: '', initials: '', phone: '', room: '', community: '',
  rent: 0,
  water: { previous: 0, current: 0, rate: 2500 },
  electric: { previous: 0, current: 0, rate: 1000 },
  dueDate: '—',
};

function InvoiceModal({ data, onClose }: { data: RenterViewData; onClose: () => void }) {
  const { name, room, rent, water, electric, dueDate } = data;
  const waterUsage = water.current - water.previous;
  const waterCost = waterUsage * water.rate;
  const elecUsage = electric.current - electric.previous;
  const electricCost = elecUsage * electric.rate;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 1100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{ width: '520px', maxWidth: '95vw', maxHeight: '92vh', overflowY: 'auto', borderRadius: '16px', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
        {/* Close bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px', background: 'var(--card)', borderRadius: '16px 16px 0 0' }}>
          <button className="sr-btn sr-btn-ghost sr-btn-sm" style={{ padding: '4px 8px' }} onClick={onClose}>
            <X size={16} /> Close
          </button>
        </div>

        {/* Invoice (white bg to match landlord preview) */}
        <div style={{ background: '#fff', color: '#1a1a2e', padding: '32px', borderRadius: '0 0 16px 16px', fontFamily: "'DM Sans', sans-serif" }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px', paddingBottom: '20px', borderBottom: '2px solid #e8ecf5' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 900, color: '#1A5CFF' }}>
              Smart-<span style={{ color: '#0AB5A0' }}>Rent</span>House
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>INVOICE</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: '#8B9AB8' }}>INV-{room}</div>
            </div>
          </div>

          {/* Bill to + Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8B9AB8', marginBottom: '6px', fontFamily: "'DM Mono', monospace" }}>Bill To</div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>{name}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Room {room} · Grand Community</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8B9AB8', marginBottom: '6px', fontFamily: "'DM Mono', monospace" }}>Invoice Date</div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{today}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Due: {dueDate}</div>
            </div>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr>
                <th style={{ background: '#f0f4ff', padding: '10px 12px', fontSize: '11px', textTransform: 'uppercase', color: '#8B9AB8', textAlign: 'left', fontFamily: "'DM Mono', monospace" }}>Description</th>
                <th style={{ background: '#f0f4ff', padding: '10px 12px', fontSize: '11px', textTransform: 'uppercase', color: '#8B9AB8', textAlign: 'right', fontFamily: "'DM Mono', monospace" }}>Calculation</th>
                <th style={{ background: '#f0f4ff', padding: '10px 12px', fontSize: '11px', textTransform: 'uppercase', color: '#8B9AB8', textAlign: 'right', fontFamily: "'DM Mono', monospace" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '11px 12px', fontSize: '13px', borderBottom: '1px solid #e8ecf5' }}>Monthly Room Rent</td>
                <td style={{ padding: '11px 12px', fontSize: '13px', borderBottom: '1px solid #e8ecf5', textAlign: 'right', color: '#6b7280', fontFamily: "'DM Mono', monospace' " }}>—</td>
                <td style={{ padding: '11px 12px', fontSize: '13px', borderBottom: '1px solid #e8ecf5', textAlign: 'right', fontWeight: 600 }}>${rent}</td>
              </tr>
              <tr>
                <td style={{ padding: '11px 12px', fontSize: '13px', borderBottom: '1px solid #e8ecf5' }}>💧 Water</td>
                <td style={{ padding: '11px 12px', fontSize: '12px', borderBottom: '1px solid #e8ecf5', textAlign: 'right', color: '#6b7280', fontFamily: "'DM Mono', monospace" }}>
                  {water.current} − {water.previous} = {waterUsage} m³ × {water.rate.toLocaleString()}
                </td>
                <td style={{ padding: '11px 12px', fontSize: '13px', borderBottom: '1px solid #e8ecf5', textAlign: 'right' }}>{waterCost.toLocaleString()} ៛</td>
              </tr>
              <tr>
                <td style={{ padding: '11px 12px', fontSize: '13px', borderBottom: '1px solid #e8ecf5' }}>⚡ Electricity</td>
                <td style={{ padding: '11px 12px', fontSize: '12px', borderBottom: '1px solid #e8ecf5', textAlign: 'right', color: '#6b7280', fontFamily: "'DM Mono', monospace" }}>
                  {electric.current} − {electric.previous} = {elecUsage} kWh × {electric.rate.toLocaleString()}
                </td>
                <td style={{ padding: '11px 12px', fontSize: '13px', borderBottom: '1px solid #e8ecf5', textAlign: 'right' }}>{electricCost.toLocaleString()} ៛</td>
              </tr>
            </tbody>
          </table>

          {/* Total */}
          <div style={{ background: '#1A5CFF', color: 'white', borderRadius: '10px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '13px', opacity: 0.85 }}>Total Due</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '22px', fontWeight: 700 }}>${rent}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '14px', opacity: 0.8 }}>+ {(waterCost + electricCost).toLocaleString()} ៛ utilities</div>
            </div>
          </div>

          <div style={{ marginTop: '16px', fontSize: '11px', color: '#8B9AB8', textAlign: 'center' }}>
            Please pay by {dueDate} to avoid late fees. Thank you for your tenancy!
          </div>
        </div>
      </div>
    </div>
  );
}

function initialsOf(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'R';
}

export function RenterDashboard() {
  const { currentUser, community } = useAuth();
  const d = new Date();
  const dateStr = d.toLocaleDateString('en-KH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const [showInvoice, setShowInvoice] = useState(false);

  const room = currentUser ? getRooms(currentUser.communityId).find(
    r => currentUser.roomNumber && r.number.toLowerCase() === currentUser.roomNumber.toLowerCase()
  ) : undefined;

  const data: RenterViewData = currentUser ? {
    name: currentUser.name,
    initials: initialsOf(currentUser.name),
    phone: currentUser.phone,
    room: currentUser.roomNumber || room?.number || '—',
    community: community?.name || '',
    rent: room?.rent ?? 0,
    water: room?.water ?? EMPTY_RENTER_DATA.water,
    electric: room?.electric ?? EMPTY_RENTER_DATA.electric,
    dueDate: room ? `Day ${room.dueDay} of each month` : '—',
  } : EMPTY_RENTER_DATA;

  const waterCost = (data.water.current - data.water.previous) * data.water.rate;
  const electricCost = (data.electric.current - data.electric.previous) * data.electric.rate;

  return (
    <>
      <div className="sr-page-header">
        <div>
          <div className="sr-page-title">Welcome back, {data.name} 👋</div>
          <div className="sr-page-sub">Room {data.room} • {data.community}</div>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}>{dateStr}</div>
      </div>

      <div className="sr-grid-2">
        <div className="sr-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div className="sr-card-title" style={{ margin: 0 }}>Room Information</div>
            <span className="sr-badge sr-badge-paid">Paid</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(10,181,160,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)', fontWeight: 'bold', fontSize: '16px' }}>
                {data.initials}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '2px' }}>{data.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={12} /> {data.phone}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--card2)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--sky)', marginBottom: '12px' }}>
                  <Droplet size={14} /> <span style={{ fontSize: '11px', fontWeight: 600, fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em' }}>WATER METER</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--muted)' }}>Previous:</span> <span style={{ fontFamily: "'DM Mono', monospace" }}>{data.water.previous}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--muted)' }}>Current:</span> <span style={{ fontFamily: "'DM Mono', monospace" }}>{data.water.current}</span>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--card2)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--amber)', marginBottom: '12px' }}>
                  <Zap size={14} /> <span style={{ fontSize: '11px', fontWeight: 600, fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em' }}>ELECTRIC METER</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--muted)' }}>Previous:</span> <span style={{ fontFamily: "'DM Mono', monospace" }}>{data.electric.previous}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--muted)' }}>Current:</span> <span style={{ fontFamily: "'DM Mono', monospace" }}>{data.electric.current}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--card2)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={16} color="var(--muted)" />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Monthly Rent</span>
              </div>
              <span style={{ fontWeight: 600, fontSize: '15px', fontFamily: "'DM Mono', monospace" }}>${data.rent}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="sr-card">
            <div className="sr-card-title">Current Bill</div>
            <div style={{ fontSize: '36px', fontFamily: "'DM Mono', monospace", fontWeight: 700, color: 'var(--white)', marginBottom: '4px' }}>
              {(waterCost + electricCost).toLocaleString()} ៛
            </div>
            <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '4px' }}>utilities + <span style={{ color: 'var(--white)', fontWeight: 600 }}>${data.rent}</span> rent</div>
            <div style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '20px' }}>Due: {data.dueDate}</div>
            <button className="sr-btn sr-btn-primary" style={{ width: '100%' }} onClick={() => setShowInvoice(true)}>
              🧾 View Invoice
            </button>
          </div>

          <div className="sr-card">
            <div className="sr-card-title">Notifications</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'var(--card2)', padding: '16px', borderRadius: '12px', borderLeft: '3px solid var(--teal)' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>Water Meter Due</div>
                <div style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.4 }}>Please submit your water meter reading by the end of the month.</div>
              </div>
              <div style={{ background: 'var(--card2)', padding: '16px', borderRadius: '12px', borderLeft: '3px solid var(--red)' }}>
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={14} color="var(--red)" /> Maintenance update
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.4 }}>Landlord has viewed your report: "Leaking sink in bathroom".</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showInvoice && <InvoiceModal data={data} onClose={() => setShowInvoice(false)} />}
    </>
  );
}
