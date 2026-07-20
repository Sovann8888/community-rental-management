import { useState } from "react";
import { useLandlord } from "../../context/LandlordContext";
import { useAuth } from "../../context/AuthContext";
import { addPaymentRecord } from "../../lib/db";

const ABA_QR_SVG = `<svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="160" height="160" fill="white"/>
  <rect x="10" y="10" width="50" height="50" rx="4" fill="#003087"/>
  <rect x="16" y="16" width="38" height="38" rx="2" fill="white"/>
  <rect x="22" y="22" width="26" height="26" rx="1" fill="#003087"/>
  <rect x="100" y="10" width="50" height="50" rx="4" fill="#003087"/>
  <rect x="106" y="16" width="38" height="38" rx="2" fill="white"/>
  <rect x="112" y="22" width="26" height="26" rx="1" fill="#003087"/>
  <rect x="10" y="100" width="50" height="50" rx="4" fill="#003087"/>
  <rect x="16" y="106" width="38" height="38" rx="2" fill="white"/>
  <rect x="22" y="112" width="26" height="26" rx="1" fill="#003087"/>
  <rect x="70" y="10" width="8" height="8" fill="#003087"/>
  <rect x="82" y="10" width="8" height="8" fill="#003087"/>
  <rect x="70" y="22" width="8" height="8" fill="#003087"/>
  <rect x="70" y="34" width="8" height="8" fill="#003087"/>
  <rect x="82" y="46" width="8" height="8" fill="#003087"/>
  <rect x="70" y="70" width="8" height="8" fill="#003087"/>
  <rect x="82" y="70" width="8" height="8" fill="#003087"/>
  <rect x="70" y="82" width="8" height="8" fill="#003087"/>
  <rect x="82" y="82" width="8" height="8" fill="#003087"/>
  <rect x="100" y="70" width="8" height="8" fill="#003087"/>
  <rect x="112" y="70" width="8" height="8" fill="#003087"/>
  <rect x="124" y="70" width="8" height="8" fill="#003087"/>
  <rect x="136" y="70" width="8" height="8" fill="#003087"/>
  <rect x="100" y="82" width="8" height="8" fill="#003087"/>
  <rect x="124" y="82" width="8" height="8" fill="#003087"/>
  <rect x="100" y="94" width="8" height="8" fill="#003087"/>
  <rect x="112" y="94" width="8" height="8" fill="#003087"/>
  <rect x="136" y="94" width="8" height="8" fill="#003087"/>
  <rect x="100" y="106" width="8" height="8" fill="#003087"/>
  <rect x="124" y="106" width="8" height="8" fill="#003087"/>
  <rect x="136" y="118" width="8" height="8" fill="#003087"/>
  <rect x="100" y="130" width="8" height="8" fill="#003087"/>
  <rect x="112" y="130" width="8" height="8" fill="#003087"/>
  <rect x="124" y="130" width="8" height="8" fill="#003087"/>
  <rect x="70" y="100" width="8" height="8" fill="#003087"/>
  <rect x="82" y="112" width="8" height="8" fill="#003087"/>
  <rect x="70" y="124" width="8" height="8" fill="#003087"/>
  <rect x="82" y="136" width="8" height="8" fill="#003087"/>
</svg>`;

export function Payment() {
  const { rooms, updateRoom } = useLandlord();
  const { currentUser } = useAuth();
  const [selectedRoomId, setSelectedRoomId] = useState<number | ''>('');

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  let waterCost = 0, electricCost = 0, rentCost = 0;
  if (selectedRoom) {
    waterCost = (selectedRoom.water.current - selectedRoom.water.previous) * selectedRoom.water.rate;
    electricCost = (selectedRoom.electric.current - selectedRoom.electric.previous) * selectedRoom.electric.rate;
    rentCost = selectedRoom.rent;
  }

  const handleVerify = () => {
    if (selectedRoom) {
      updateRoom(selectedRoom.id, { paymentStatus: 'Paid' });
      if (selectedRoom.phone && currentUser) {
        addPaymentRecord({
          phone: selectedRoom.phone,
          communityId: currentUser.communityId,
          description: `Rent + utilities — Room ${selectedRoom.number}`,
          amountUSD: rentCost,
          amountRiel: waterCost + electricCost,
          status: 'Paid',
        });
      }
      setSelectedRoomId('');
      alert(`✅ Payment verified for Room ${selectedRoom.number} — ${selectedRoom.renter}!`);
    }
  };

  return (
    <>
      <div className="sr-page-header">
        <div>
          <div className="sr-page-title">Payment Checker</div>
          <div className="sr-page-sub">Record and verify ABA bank transfers from renters</div>
        </div>
      </div>

      <div className="sr-grid-2" style={{ alignItems: 'start' }}>
        <div>
          <div className="sr-card" style={{ marginBottom: '16px' }}>
            <div className="sr-card-title">Record New Payment</div>

            {/* ABA Bank only */}
            <div className="sr-section-label">Payment Method</div>
            <div style={{ background: 'rgba(0,48,135,0.12)', border: '2px solid #003087', borderRadius: '12px', padding: '18px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#003087', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🏦</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '16px', color: '#4a90e2' }}>ABA Bank</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>ABA PayWay · Account: 000 123 456</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <span className="sr-badge sr-badge-paid">Selected</span>
              </div>
            </div>

            <div className="sr-form-group">
              <label className="sr-form-label">Room</label>
              <select className="sr-form-select" value={selectedRoomId} onChange={e => setSelectedRoomId(Number(e.target.value))}>
                <option value="">— Select room pending payment —</option>
                {rooms.filter(r => r.status === 'Occupied').map(r => (
                  <option key={r.id} value={r.id}>
                    Room {r.number || '?'} — {r.renter} ({r.paymentStatus})
                  </option>
                ))}
              </select>
            </div>

            <div className="sr-form-row">
              <div className="sr-form-group">
                <label className="sr-form-label">Utilities Total (KHR)</label>
                <input className="sr-form-input" type="number" value={waterCost + electricCost} readOnly />
              </div>
              <div className="sr-form-group">
                <label className="sr-form-label">Rent (USD)</label>
                <input className="sr-form-input" type="number" value={rentCost} readOnly />
              </div>
            </div>

            <div className="sr-form-group">
              <label className="sr-form-label">Payment Date</label>
              <input className="sr-form-input" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="sr-btn sr-btn-primary" onClick={handleVerify} disabled={!selectedRoomId}>
                🔍 Verify & Mark as Paid
              </button>
            </div>
          </div>

          {/* ABA QR */}
          <div className="sr-card">
            <div className="sr-card-title">ABA QR Code</div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ background: '#fff', borderRadius: '12px', padding: '12px', display: 'inline-block' }}
                dangerouslySetInnerHTML={{ __html: ABA_QR_SVG }} />
              <div style={{ flex: 1, minWidth: '160px' }}>
                <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '12px' }}>
                  Share this QR with renters so they can pay directly via ABA Mobile or any KHQR-compatible app.
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: 'var(--sky)', background: 'var(--card2)', borderRadius: '8px', padding: '10px 14px' }}>
                  <div>Name: SOKSOVANN P.</div>
                  <div>Bank: ABA Bank</div>
                  <div>Account: 000 123 456</div>
                  <div style={{ marginTop: '6px', color: 'var(--muted)', fontSize: '11px' }}>KHQR Standard · ABA PayWay</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sr-card">
          <div className="sr-card-title">Payment Ledger</div>
          <div className="sr-table-wrap">
            <table className="sr-table">
              <thead><tr>
                <th>Room</th><th>Renter</th><th>Amount</th><th>Status</th>
              </tr></thead>
              <tbody>
                {rooms.filter(r => r.status === 'Occupied').map(r => {
                  const utilities = (r.water.current - r.water.previous) * r.water.rate + (r.electric.current - r.electric.previous) * r.electric.rate;
                  return (
                    <tr key={r.id}>
                      <td><b>{r.number || '—'}</b></td>
                      <td>{r.renter}</td>
                      <td style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px' }}>
                        ${r.rent}<br />
                        <span style={{ color: 'var(--muted)' }}>+{utilities.toLocaleString()} ៛</span>
                      </td>
                      <td>
                        {r.paymentStatus === 'Paid'
                          ? <span className="sr-badge sr-badge-paid">Paid</span>
                          : r.paymentStatus === 'Pending'
                          ? <span className="sr-badge" style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,0.3)' }}>Pending</span>
                          : r.paymentStatus === 'Overdue'
                          ? <span className="sr-badge sr-badge-overdue">Overdue</span>
                          : <span className="sr-badge sr-badge-pending">Due</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
