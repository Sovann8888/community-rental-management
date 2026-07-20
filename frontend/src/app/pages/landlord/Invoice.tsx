import { useState, useEffect } from "react";
import { useLandlord } from "../../context/LandlordContext";
import qrImg from "../../../imports/photo_2026-06-10_12-31-27-1.jpg";

export function Invoice() {
  const { rooms } = useLandlord();
  const [selectedRoomId, setSelectedRoomId] = useState<number | ''>('');
  const [preview, setPreview] = useState(false);
  
  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  // Form states
  const [waterCost, setWaterCost] = useState(0);
  const [electricCost, setElectricCost] = useState(0);
  const [rentCost, setRentCost] = useState(0);

  useEffect(() => {
    if (selectedRoom) {
      setWaterCost((selectedRoom.water.current - selectedRoom.water.previous) * selectedRoom.water.rate);
      setElectricCost((selectedRoom.electric.current - selectedRoom.electric.previous) * selectedRoom.electric.rate);
      setRentCost(selectedRoom.rent);
      setPreview(true);
    } else {
      setPreview(false);
    }
  }, [selectedRoomId, selectedRoom]);

  const handleSelectRoom = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRoomId(Number(e.target.value));
  };

  return (
    <>
      <div className="sr-page-header">
        <div>
          <div className="sr-page-title">Invoice Creator</div>
          <div className="sr-page-sub">Generate clear digital bills for renters</div>
        </div>
      </div>

      <div className="sr-grid-2">
        <div className="sr-card">
          <div className="sr-card-title">Invoice Details</div>

          <div className="sr-form-group">
            <label className="sr-form-label">Room Number</label>
            <select className="sr-form-select" value={selectedRoomId} onChange={handleSelectRoom}>
              <option value="">— Select room —</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>Room {r.number} ({r.renter || 'Vacant'})</option>
              ))}
            </select>
          </div>

          <div className="sr-form-group">
            <label className="sr-form-label">Invoice Month</label>
            <input className="sr-form-input" type="month" />
          </div>

          <div className="sr-form-row">
            <div className="sr-form-group">
              <label className="sr-form-label">Water Cost (៛)</label>
              <input className="sr-form-input" type="number" value={waterCost} readOnly />
            </div>
            <div className="sr-form-group">
              <label className="sr-form-label">Electricity Cost (៛)</label>
              <input className="sr-form-input" type="number" value={electricCost} readOnly />
            </div>
          </div>

          <div className="sr-form-group">
            <label className="sr-form-label">Monthly Room Rent (USD)</label>
            <input className="sr-form-input" type="number" value={rentCost} readOnly />
          </div>

          <div className="sr-form-group">
            <label className="sr-form-label">Due Date</label>
            <input className="sr-form-input" type="date" />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="sr-btn sr-btn-teal" onClick={() => alert('Invoice Sent!')} disabled={!selectedRoomId}>📤 Send to Renter</button>
          </div>
        </div>

        <div>
          <div className="sr-section-label">Invoice Preview</div>
          {preview && selectedRoom ? (
            <div style={{ background: 'var(--white)', color: '#1a1a2e', borderRadius: '16px', padding: '32px', fontFamily: "'DM Sans', sans-serif" }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px', paddingBottom: '20px', borderBottom: '2px solid #e8ecf5' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 900, color: '#1A5CFF' }}>Smart-<span style={{ color: '#0AB5A0' }}>Rent</span>House</div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>INVOICE</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: '#8B9AB8' }}>INV-{selectedRoom.number}</div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8B9AB8', marginBottom: '6px', fontFamily: "'DM Mono', monospace" }}>Bill To</div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>{selectedRoom.renter}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Room {selectedRoom.number}</div>
                </div>
              </div>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                  <tr>
                    <th style={{ background: '#f0f4ff', padding: '10px 12px', fontSize: '11px', textTransform: 'uppercase', color: '#8B9AB8', textAlign: 'left', fontFamily: "'DM Mono', monospace" }}>Description</th>
                    <th style={{ background: '#f0f4ff', padding: '10px 12px', fontSize: '11px', textTransform: 'uppercase', color: '#8B9AB8', textAlign: 'right', fontFamily: "'DM Mono', monospace" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '11px 12px', fontSize: '13px', borderBottom: '1px solid #e8ecf5' }}>Room Rent</td>
                    <td style={{ padding: '11px 12px', fontSize: '13px', borderBottom: '1px solid #e8ecf5', textAlign: 'right', fontWeight: 600 }}>${rentCost}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '11px 12px', fontSize: '13px', borderBottom: '1px solid #e8ecf5', color: '#6b7280' }}>
                      Water ({selectedRoom.water.current} - {selectedRoom.water.previous} m³) × {selectedRoom.water.rate}៛
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: '13px', borderBottom: '1px solid #e8ecf5', textAlign: 'right' }}>{waterCost.toLocaleString()} ៛</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '11px 12px', fontSize: '13px', borderBottom: '1px solid #e8ecf5', color: '#6b7280' }}>
                      Electricity ({selectedRoom.electric.current} - {selectedRoom.electric.previous} kWh) × {selectedRoom.electric.rate}៛
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: '13px', borderBottom: '1px solid #e8ecf5', textAlign: 'right' }}>{electricCost.toLocaleString()} ៛</td>
                  </tr>
                </tbody>
              </table>
              
              <div style={{ background: '#1A5CFF', color: 'white', borderRadius: '10px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', opacity: 0.8 }}>Total Due</div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '22px', fontWeight: 700 }}>${rentCost}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '14px', opacity: 0.8 }}>+ {(waterCost + electricCost).toLocaleString()} ៛</div>
                </div>
              </div>

              <div style={{ borderTop: '2px dashed #e8ecf5', paddingTop: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8B9AB8', fontFamily: "'DM Mono', monospace", marginBottom: '4px' }}>Pay via KHQR · ABA Bank</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Scan with ABA Mobile or any KHQR-compatible app</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <img src={qrImg} alt="ABA KHQR — SOKSOVANN PICH" style={{ width: '150px', height: 'auto', borderRadius: '12px', border: '1px solid #e8ecf5' }} />
                  <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.9 }}>
                    <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '14px' }}>SOKSOVANN PICH</div>
                    <div>🏦 ABA Bank</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px' }}>Account: 000 123 456</div>
                    <div style={{ marginTop: '8px', padding: '6px 12px', background: '#f0f4ff', borderRadius: '6px', color: '#1A5CFF', fontSize: '11px', fontWeight: 600 }}>
                      Note: Room {selectedRoom.number || '?'} — {selectedRoom.renter}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '16px', fontSize: '11px', color: '#8B9AB8', textAlign: 'center' }}>Thank you for your tenancy. Late payments may incur additional fees.</div>
            </div>
          ) : (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '60px', textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🧾</div>
              Select a room to preview the invoice automatically based on meter calculations.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
