import { useState, useMemo, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { X, Edit2, AlertTriangle, Plus } from "lucide-react";
import { useLandlord, Room, PaymentStatus } from "../../context/LandlordContext";

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CURRENT_YEAR = 2026;
const CURRENT_MONTH = 5;
const YEARS = [2025, 2026];

function getRoomStatusClass(room: Room): string {
  if (room.status === 'Vacant') return 'sr-room-chip vacant';
  if (room.paymentStatus === 'Paid') return 'sr-room-chip paid';
  if (room.paymentStatus === 'Overdue') return 'sr-room-chip overdue';
  return 'sr-room-chip pending';
}

function getRoomLabel(room: Room): string {
  if (room.status === 'Vacant') return 'Vacant';
  if (room.paymentStatus === 'Paid') return 'Paid';
  if (room.paymentStatus === 'Overdue') return 'Late';
  if (room.paymentStatus === 'Pending') return 'Pend.';
  return 'Due';
}

function calcInvoice(room: Room) {
  const waterUsage = room.water.current - room.water.previous;
  const waterTotal = waterUsage * room.water.rate;
  const elecUsage = room.electric.current - room.electric.previous;
  const elecTotal = elecUsage * room.electric.rate;
  return { waterUsage, waterTotal, elecUsage, elecTotal };
}

function RoomDetailModal({ room, onClose, onSave, isHistorical }: {
  room: Room; onClose: () => void; onSave: (r: Room) => void; isHistorical: boolean;
}) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Room>({ ...room });
  const inv = calcInvoice(editMode ? form : room);
  const display = editMode ? form : room;

  const handleSave = () => { onSave(form); setEditMode(false); };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
      <div className="sr-card" style={{ width: '540px', maxWidth: '95vw', maxHeight: '92vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div className="sr-card-title" style={{ margin: 0 }}>Room {room.number || '—'}</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!editMode && (
              <button className="sr-btn sr-btn-ghost sr-btn-sm" onClick={() => setEditMode(true)}>
                <Edit2 size={14} /> Edit
              </button>
            )}
            {editMode && <button className="sr-btn sr-btn-primary sr-btn-sm" onClick={handleSave}>Save</button>}
            {editMode && <button className="sr-btn sr-btn-ghost sr-btn-sm" onClick={() => { setForm({ ...room }); setEditMode(false); }}>Cancel</button>}
            <button className="sr-btn sr-btn-ghost sr-btn-sm" style={{ padding: '4px 8px' }} onClick={onClose}><X size={16} /></button>
          </div>
        </div>

        {isHistorical && (
          <div style={{ fontSize: '11px', color: 'var(--amber)', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '8px 12px', marginBottom: '14px' }}>
            📅 Historical record — editable. Changes saved to that month's snapshot.
          </div>
        )}

        {/* Renter & rent */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '14px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', marginBottom: '4px' }}>Renter</div>
            {editMode ? (
              <>
                <input className="sr-form-input" value={form.renter} style={{ marginBottom: '6px' }}
                  placeholder="Renter name"
                  onChange={e => setForm({ ...form, renter: e.target.value, status: e.target.value && e.target.value !== 'Vacant' ? 'Occupied' : 'Vacant' })} />
                <input className="sr-form-input" value={form.phone} placeholder="Phone"
                  onChange={e => setForm({ ...form, phone: e.target.value })} />
              </>
            ) : (
              <>
                <div style={{ fontWeight: 600, fontSize: '16px' }}>{display.renter}</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{display.phone || 'No phone'}</div>
              </>
            )}
          </div>
          <div style={{ textAlign: 'right', minWidth: '120px' }}>
            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', marginBottom: '4px' }}>Rent</div>
            {editMode ? (
              <input className="sr-form-input" type="number" value={form.rent} style={{ width: '90px', textAlign: 'right' }}
                onChange={e => setForm({ ...form, rent: Number(e.target.value) })} />
            ) : (
              <div style={{ fontWeight: 600, fontSize: '16px', fontFamily: "'DM Mono', monospace" }}>${display.rent}/mo</div>
            )}
            <div style={{ marginTop: '8px' }}>
              {display.status === 'Vacant' ? <span className="sr-badge sr-badge-pending">Vacant</span>
                : display.paymentStatus === 'Paid' ? <span className="sr-badge sr-badge-paid">Paid</span>
                : display.paymentStatus === 'Pending' ? <span className="sr-badge" style={{ backgroundColor: 'rgba(245,158,11,0.2)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,0.4)' }}>Pending</span>
                : display.paymentStatus === 'Overdue' ? <span className="sr-badge sr-badge-overdue">Overdue</span>
                : <span className="sr-badge sr-badge-pending">N/A</span>}
            </div>
          </div>
        </div>

        {/* Payment status edit */}
        {editMode && (
          <div className="sr-form-group" style={{ marginBottom: '14px' }}>
            <label className="sr-form-label">Payment Status</label>
            <select className="sr-form-select" value={form.paymentStatus} onChange={e => setForm({ ...form, paymentStatus: e.target.value as PaymentStatus })}>
              <option value="Paid">Paid (confirmed)</option>
              <option value="Pending">Pending (receipt uploaded, awaiting verify)</option>
              <option value="Overdue">Overdue (past due, no payment)</option>
              <option value="N/A">N/A</option>
            </select>
          </div>
        )}

        {/* Room number edit */}
        {editMode && (
          <div className="sr-form-group" style={{ marginBottom: '14px' }}>
            <label className="sr-form-label">Room Number</label>
            <input className="sr-form-input" value={form.number} placeholder="e.g. 001, 102, 218"
              onChange={e => setForm({ ...form, number: e.target.value })} />
          </div>
        )}

        {/* Meter readings */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div style={{ backgroundColor: 'var(--card2)', padding: '14px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--sky)', marginBottom: '10px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em' }}>💧 WATER (m³)</div>
            {editMode ? (
              <>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="sr-form-label" style={{ fontSize: '10px' }}>Prev</label>
                    <input type="number" className="sr-form-input" value={form.water.previous} onChange={e => setForm({ ...form, water: { ...form.water, previous: Number(e.target.value) } })} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="sr-form-label" style={{ fontSize: '10px' }}>Current</label>
                    <input type="number" className="sr-form-input" value={form.water.current} onChange={e => setForm({ ...form, water: { ...form.water, current: Number(e.target.value) } })} />
                  </div>
                </div>
                <div>
                  <label className="sr-form-label" style={{ fontSize: '10px' }}>Rate (៛/m³)</label>
                  <input type="number" className="sr-form-input" value={form.water.rate} onChange={e => setForm({ ...form, water: { ...form.water, rate: Number(e.target.value) } })} />
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}><span style={{ color: 'var(--muted)' }}>Prev:</span><span style={{ fontFamily: "'DM Mono', monospace" }}>{display.water.previous}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}><span style={{ color: 'var(--muted)' }}>Current:</span><span style={{ fontFamily: "'DM Mono', monospace" }}>{display.water.current}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{ color: 'var(--muted)' }}>Rate:</span><span style={{ fontFamily: "'DM Mono', monospace" }}>{display.water.rate.toLocaleString()} ៛</span></div>
              </>
            )}
          </div>
          <div style={{ backgroundColor: 'var(--card2)', padding: '14px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--amber)', marginBottom: '10px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em' }}>⚡ ELECTRIC (kWh)</div>
            {editMode ? (
              <>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="sr-form-label" style={{ fontSize: '10px' }}>Prev</label>
                    <input type="number" className="sr-form-input" value={form.electric.previous} onChange={e => setForm({ ...form, electric: { ...form.electric, previous: Number(e.target.value) } })} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="sr-form-label" style={{ fontSize: '10px' }}>Current</label>
                    <input type="number" className="sr-form-input" value={form.electric.current} onChange={e => setForm({ ...form, electric: { ...form.electric, current: Number(e.target.value) } })} />
                  </div>
                </div>
                <div>
                  <label className="sr-form-label" style={{ fontSize: '10px' }}>Rate (៛/kWh)</label>
                  <input type="number" className="sr-form-input" value={form.electric.rate} onChange={e => setForm({ ...form, electric: { ...form.electric, rate: Number(e.target.value) } })} />
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}><span style={{ color: 'var(--muted)' }}>Prev:</span><span style={{ fontFamily: "'DM Mono', monospace" }}>{display.electric.previous}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}><span style={{ color: 'var(--muted)' }}>Current:</span><span style={{ fontFamily: "'DM Mono', monospace" }}>{display.electric.current}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{ color: 'var(--muted)' }}>Rate:</span><span style={{ fontFamily: "'DM Mono', monospace" }}>{display.electric.rate.toLocaleString()} ៛</span></div>
              </>
            )}
          </div>
        </div>

        {/* Invoice */}
        {display.status === 'Occupied' && (
          <div style={{ background: 'linear-gradient(135deg, rgba(26,92,255,0.08) 0%, rgba(147,51,234,0.08) 100%)', border: '1px solid rgba(26,92,255,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', color: 'var(--sky)', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', marginBottom: '12px' }}>📄 Invoice Breakdown</div>
            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: "'DM Mono', monospace" }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Rent</span><span>${display.rent}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--sky)' }}>
                <span>Water: {display.water.current}−{display.water.previous}={inv.waterUsage}m³×{display.water.rate.toLocaleString()}៛</span>
                <span>{inv.waterTotal.toLocaleString()} ៛</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--amber)' }}>
                <span>Elec: {display.electric.current}−{display.electric.previous}={inv.elecUsage}kWh×{display.electric.rate.toLocaleString()}៛</span>
                <span>{inv.elecTotal.toLocaleString()} ៛</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>Total Utilities</span>
                <span style={{ color: 'var(--green)' }}>{(inv.waterTotal + inv.elecTotal).toLocaleString()} ៛</span>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', marginBottom: '8px' }}>Maintenance</div>
          {editMode ? (
            <input className="sr-form-input" value={form.problem} placeholder="No issues" onChange={e => setForm({ ...form, problem: e.target.value })} />
          ) : (
            <div style={{ fontSize: '13px', color: display.problem ? 'var(--red)' : 'var(--muted)', lineHeight: 1.5 }}>{display.problem || 'No issues reported'}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddHistoricalRoomModal({ onClose, onAdd }: { onClose: () => void; onAdd: (r: Room) => void }) {
  const [form, setForm] = useState<Room>({
    id: Date.now(), number: '', floor: 'G', renter: '', rent: 60, status: 'Occupied',
    phone: '', water: { previous: 0, current: 0, rate: 2500 },
    electric: { previous: 0, current: 0, rate: 1000 }, paymentStatus: 'Paid', problem: '', dueDay: 24
  });

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
      <div className="sr-card" style={{ width: '480px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div className="sr-card-title" style={{ margin: 0 }}>Add Historical Room Record</div>
          <button className="sr-btn sr-btn-ghost sr-btn-sm" style={{ padding: '4px 8px' }} onClick={onClose}><X size={16} /></button>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>Add a room record for this historical period — useful for rooms with different renters than today.</div>

        <div className="sr-form-row">
          <div className="sr-form-group">
            <label className="sr-form-label">Room Number</label>
            <input className="sr-form-input" value={form.number} placeholder="e.g. 001" onChange={e => setForm({ ...form, number: e.target.value })} />
          </div>
          <div className="sr-form-group">
            <label className="sr-form-label">Floor</label>
            <select className="sr-form-select" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })}>
              <option value="G">Ground</option><option value="1">1st</option><option value="2">2nd</option>
              <option value="3">3rd</option><option value="4">4th</option><option value="5">5th</option>
            </select>
          </div>
        </div>
        <div className="sr-form-row">
          <div className="sr-form-group">
            <label className="sr-form-label">Renter Name</label>
            <input className="sr-form-input" value={form.renter} placeholder="e.g. Sok Dara" onChange={e => setForm({ ...form, renter: e.target.value })} />
          </div>
          <div className="sr-form-group">
            <label className="sr-form-label">Phone</label>
            <input className="sr-form-input" value={form.phone} placeholder="+855..." onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <div className="sr-form-row">
          <div className="sr-form-group">
            <label className="sr-form-label">Rent (USD)</label>
            <input type="number" className="sr-form-input" value={form.rent} onChange={e => setForm({ ...form, rent: Number(e.target.value) })} />
          </div>
          <div className="sr-form-group">
            <label className="sr-form-label">Payment Status</label>
            <select className="sr-form-select" value={form.paymentStatus} onChange={e => setForm({ ...form, paymentStatus: e.target.value as PaymentStatus })}>
              <option value="Paid">Paid</option><option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option><option value="N/A">N/A</option>
            </select>
          </div>
        </div>
        <div className="sr-section-label">💧 Water Meter</div>
        <div className="sr-form-row">
          <div className="sr-form-group">
            <label className="sr-form-label">Previous</label>
            <input type="number" className="sr-form-input" value={form.water.previous} onChange={e => setForm({ ...form, water: { ...form.water, previous: Number(e.target.value) } })} />
          </div>
          <div className="sr-form-group">
            <label className="sr-form-label">Current</label>
            <input type="number" className="sr-form-input" value={form.water.current} onChange={e => setForm({ ...form, water: { ...form.water, current: Number(e.target.value) } })} />
          </div>
        </div>
        <div className="sr-section-label">⚡ Electric Meter</div>
        <div className="sr-form-row">
          <div className="sr-form-group">
            <label className="sr-form-label">Previous</label>
            <input type="number" className="sr-form-input" value={form.electric.previous} onChange={e => setForm({ ...form, electric: { ...form.electric, previous: Number(e.target.value) } })} />
          </div>
          <div className="sr-form-group">
            <label className="sr-form-label">Current</label>
            <input type="number" className="sr-form-input" value={form.electric.current} onChange={e => setForm({ ...form, electric: { ...form.electric, current: Number(e.target.value) } })} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button className="sr-btn sr-btn-primary" onClick={() => { onAdd({ ...form, id: Date.now(), status: form.renter ? 'Occupied' : 'Vacant' }); onClose(); }}>
            <Plus size={14} /> Add Record
          </button>
          <button className="sr-btn sr-btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function CollectionChart({ onClose, selectedYear, selectedMonth, isCurrentMonth, monthlyHistory, currentStats }: {
  onClose: () => void; selectedYear: number; selectedMonth: number; isCurrentMonth: boolean;
  monthlyHistory: { [key: string]: { collectedUSD: number; collectedRiel: number } };
  currentStats: { collectedUSD: number; collectedRiel: number };
}) {
  const chartData = useMemo(() => {
    if (!isCurrentMonth) {
      const key = `${selectedYear}-${selectedMonth}`;
      const snap = monthlyHistory[key];
      return [{ month: MONTHS[selectedMonth], usd: snap?.collectedUSD ?? 0, riel: Math.round((snap?.collectedRiel ?? 0) / 1000) }];
    }
    const data = [];
    for (let i = 5; i >= 0; i--) {
      let y = CURRENT_YEAR, m = CURRENT_MONTH - i;
      if (m < 0) { m += 12; y -= 1; }
      const key = `${y}-${m}`;
      const isNow = y === CURRENT_YEAR && m === CURRENT_MONTH;
      const snap = isNow ? currentStats : monthlyHistory[key];
      data.push({ month: MONTHS[m], usd: snap?.collectedUSD ?? 0, riel: Math.round((snap?.collectedRiel ?? 0) / 1000) });
    }
    return data;
  }, [isCurrentMonth, selectedYear, selectedMonth, monthlyHistory, currentStats]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
      <div className="sr-card" style={{ width: '560px', maxWidth: '95vw', border: '1px solid rgba(255,255,255,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div className="sr-card-title" style={{ margin: 0 }}>Collection History</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{isCurrentMonth ? 'Last 6 months comparison' : `${MONTHS[selectedMonth]} ${selectedYear} only`}</div>
          </div>
          <button className="sr-btn sr-btn-ghost sr-btn-sm" style={{ padding: '4px 8px' }} onClick={onClose}><X size={16} /></button>
        </div>
        <div style={{ height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value, name) => name === 'usd' ? [`$${value}`, 'Rent (USD)'] : [`${value}K ៛`, 'Utilities']} />
              <Line type="monotone" dataKey="usd" stroke="var(--blue)" strokeWidth={2} dot={{ fill: 'var(--blue)', r: 4 }} name="usd" />
              <Line type="monotone" dataKey="riel" stroke="var(--green)" strokeWidth={2} dot={{ fill: 'var(--green)', r: 4 }} name="riel" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', gap: '24px', marginTop: '12px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--blue)' }}><div style={{ width: '12px', height: '2px', background: 'var(--blue)' }}></div>Rent (USD)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--green)' }}><div style={{ width: '12px', height: '2px', background: 'var(--green)' }}></div>Utilities (K Riel)</div>
        </div>
      </div>
    </div>
  );
}

export function LandlordDashboard() {
  const { rooms, updateRoom, communityName, lateFee, setLateFee, monthlyHistory, setMonthlyHistory } = useLandlord();

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-KH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);
  const [showChart, setShowChart] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [editingLateFee, setEditingLateFee] = useState(false);
  const [lateFeeInput, setLateFeeInput] = useState(String(lateFee));
  const [showAddHistorical, setShowAddHistorical] = useState(false);

  const isCurrentPeriod = selectedYear === CURRENT_YEAR && selectedMonth === CURRENT_MONTH;

  const periodRooms = useMemo(() => {
    if (isCurrentPeriod) return rooms;
    const key = `${selectedYear}-${selectedMonth}`;
    return monthlyHistory[key]?.rooms ?? [];
  }, [isCurrentPeriod, selectedYear, selectedMonth, rooms, monthlyHistory]);

  const occupiedRooms = periodRooms.filter(r => r.status === 'Occupied');
  const paidRooms = occupiedRooms.filter(r => r.paymentStatus === 'Paid');
  const pendingRooms = occupiedRooms.filter(r => r.paymentStatus === 'Pending');
  const overdueRooms = occupiedRooms.filter(r => r.paymentStatus === 'Overdue');
  const collectionRate = occupiedRooms.length > 0 ? Math.round((paidRooms.length / occupiedRooms.length) * 100) : 0;

  let collectedUSD = 0, collectedRiel = 0;
  if (isCurrentPeriod) {
    paidRooms.forEach(r => {
      collectedUSD += r.rent;
      collectedRiel += (r.water.current - r.water.previous) * r.water.rate + (r.electric.current - r.electric.previous) * r.electric.rate;
    });
  } else {
    const key = `${selectedYear}-${selectedMonth}`;
    collectedUSD = monthlyHistory[key]?.collectedUSD ?? 0;
    collectedRiel = monthlyHistory[key]?.collectedRiel ?? 0;
  }

  const handleSaveRoom = (updated: Room) => {
    if (isCurrentPeriod) {
      updateRoom(updated.id, updated);
    } else {
      const key = `${selectedYear}-${selectedMonth}`;
      const snap = monthlyHistory[key];
      if (snap) {
        const newRooms = snap.rooms.map(r => r.id === updated.id ? updated : r);
        setMonthlyHistory(prev => ({ ...prev, [key]: { ...snap, rooms: newRooms } }));
      }
    }
    setSelectedRoom(updated);
  };

  const handleAddHistoricalRoom = (room: Room) => {
    const key = `${selectedYear}-${selectedMonth}`;
    const snap = monthlyHistory[key] ?? { rooms: [], collectedUSD: 0, collectedRiel: 0 };
    setMonthlyHistory(prev => ({ ...prev, [key]: { ...snap, rooms: [...snap.rooms, room] } }));
  };

  const saveLateFee = () => { setLateFee(Number(lateFeeInput) || 0); setEditingLateFee(false); };

  const meterCarryOverMismatches = useMemo(() => {
    if (!isCurrentPeriod) return [];
    let prevM = CURRENT_MONTH - 1, prevY = CURRENT_YEAR;
    if (prevM < 0) { prevM = 11; prevY -= 1; }
    const prevSnap = monthlyHistory[`${prevY}-${prevM}`];
    if (!prevSnap) return [];
    return rooms.filter(r => {
      const p = prevSnap.rooms.find(pr => pr.id === r.id);
      if (!p) return false;
      return p.water.current !== r.water.previous || p.electric.current !== r.electric.previous;
    }).map(r => {
      const p = prevSnap.rooms.find(pr => pr.id === r.id)!;
      return { room: r, prevWaterCurrent: p.water.current, prevElecCurrent: p.electric.current };
    });
  }, [isCurrentPeriod, rooms, monthlyHistory]);

  const applyMeterCarryOver = useCallback(() => {
    meterCarryOverMismatches.forEach(({ room, prevWaterCurrent, prevElecCurrent }) => {
      updateRoom(room.id, {
        water: { ...room.water, previous: prevWaterCurrent },
        electric: { ...room.electric, previous: prevElecCurrent },
      });
    });
  }, [meterCarryOverMismatches, updateRoom]);

  return (
    <>
      {/* Header */}
      <div className="sr-page-header">
        <div>
          <div className="sr-page-title">Good morning 👋</div>
          <div className="sr-page-sub">Here's what's happening at {communityName} today</div>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}>{dateStr}</div>
      </div>

      {/* Period Selector */}
      <div className="sr-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          {YEARS.map(y => (
            <button key={y} onClick={() => { setSelectedYear(y); setSelectedMonth(y === CURRENT_YEAR ? CURRENT_MONTH : 11); }}
              style={{ padding: '4px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none', background: selectedYear === y ? 'var(--blue)' : 'var(--card2)', color: selectedYear === y ? '#fff' : 'var(--muted)', fontFamily: "'DM Mono', monospace" }}
            >{y}</button>
          ))}
          <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: '4px' }}>← Select year</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {MONTHS.map((m, i) => {
            const isFuture = selectedYear === CURRENT_YEAR && i > CURRENT_MONTH;
            const isSelected = selectedMonth === i;
            const isCurrent = selectedYear === CURRENT_YEAR && i === CURRENT_MONTH;
            return (
              <button key={m} disabled={isFuture} onClick={() => setSelectedMonth(i)}
                style={{ padding: '4px 10px', borderRadius: '16px', fontSize: '12px', cursor: isFuture ? 'not-allowed' : 'pointer', border: isCurrent && !isSelected ? '1px solid rgba(26,92,255,0.5)' : '1px solid transparent', background: isSelected ? (isCurrent ? 'var(--blue)' : 'rgba(26,92,255,0.6)') : 'var(--card2)', color: isFuture ? 'var(--border)' : isSelected ? '#fff' : 'var(--muted)', fontFamily: "'DM Mono', monospace", transition: 'all 0.15s' }}
              >{m}</button>
            );
          })}
        </div>
        {!isCurrentPeriod && (
          <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📅</span> Viewing historical data for {MONTHS[selectedMonth]} {selectedYear} — all values editable
          </div>
        )}
      </div>

      {/* ── NEW HERO LAYOUT: big collected + 3 small right column ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', marginBottom: '20px' }}>
        {/* Big collected card */}
        <div className="sr-stat-card blue" onClick={() => setShowChart(true)}
          style={{ cursor: 'pointer', padding: '32px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '200px' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Collected — {MONTHS[selectedMonth]} {selectedYear}
            </div>
            <div style={{ fontSize: '52px', fontFamily: "'DM Mono', monospace", fontWeight: 700, lineHeight: 1.1, color: '#fff', marginBottom: '6px' }}>
              ${collectedUSD.toLocaleString()}
            </div>
            <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', fontFamily: "'DM Mono', monospace" }}>
              + {collectedRiel.toLocaleString()} ៛ utilities
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>{collectionRate}%</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Collection rate</div>
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textAlign: 'right' }}>
              📊 Click for chart<br />
              <span style={{ fontSize: '10px' }}>{paidRooms.length} of {occupiedRooms.length} rooms paid</span>
            </div>
          </div>
        </div>

        {/* 3 small status cards stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="sr-stat-card teal" style={{ padding: '14px 18px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{paidRooms.length}/{occupiedRooms.length}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>Rooms paid</div>
              </div>
              <div style={{ fontSize: '24px' }}>🏠</div>
            </div>
          </div>

          <div className="sr-stat-card amber" style={{ padding: '14px 18px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{pendingRooms.length}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>Pending review</div>
              </div>
              <div style={{ fontSize: '24px' }}>⏳</div>
            </div>
          </div>

          <div className="sr-stat-card red" style={{ padding: '14px 18px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{overdueRooms.length}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>No payment submitted</div>
                {editingLateFee ? (
                  <span onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <input type="number" value={lateFeeInput} style={{ width: '46px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', padding: '2px 4px', color: '#fff', fontSize: '11px' }}
                      onChange={e => setLateFeeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveLateFee()} />
                    <button style={{ fontSize: '10px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '4px', padding: '2px 6px', color: '#fff', cursor: 'pointer' }} onClick={saveLateFee}>✓</button>
                  </span>
                ) : (
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', marginTop: '4px', cursor: 'pointer' }} onClick={() => { setLateFeeInput(String(lateFee)); setEditingLateFee(true); }}>
                    Late fee: ${lateFee} · tap to edit
                  </div>
                )}
              </div>
              <div style={{ fontSize: '24px' }}>🚨</div>
            </div>
          </div>
        </div>
      </div>

      {meterCarryOverMismatches.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.12) 0%, rgba(10,181,160,0.12) 100%)', border: '1px solid rgba(14,165,233,0.35)', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '22px' }}>🔗</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: 'var(--sky)', fontSize: '14px', marginBottom: '3px' }}>Meter carry-over mismatch detected</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
              {meterCarryOverMismatches.map(({ room, prevWaterCurrent, prevElecCurrent }) => (
                <span key={room.id} style={{ marginRight: '10px' }}>
                  Room {room.number || '?'}: Water {prevWaterCurrent}→{room.water.previous}, Elec {prevElecCurrent}→{room.electric.previous}
                </span>
              ))}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>Last month's ending readings don't match this month's starting readings.</div>
          </div>
          <button className="sr-btn sr-btn-teal sr-btn-sm" onClick={applyMeterCarryOver}>🔄 Sync Carry-Over</button>
        </div>
      )}

      {/* Room Status Overview */}
      <div className="sr-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div className="sr-card-title" style={{ margin: 0 }}>Room Status Overview — {periodRooms.length} Rooms</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{MONTHS[selectedMonth]} {selectedYear} · click any room for details</div>
          </div>
          {!isCurrentPeriod && (
            <button className="sr-btn sr-btn-ghost sr-btn-sm" onClick={() => setShowAddHistorical(true)}>
              <Plus size={14} /> Add Historical Room
            </button>
          )}
        </div>

        <div className="sr-room-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: '8px' }}>
          {periodRooms.map(room => (
            <div key={room.id} className={getRoomStatusClass(room)}
              style={{ cursor: 'pointer', transition: 'transform 0.12s' }}
              onClick={() => setSelectedRoom(room)}
              title={`Room ${room.number} — ${room.renter}`}
            >
              <span className="room-num">{room.number || '?'}</span>
              {getRoomLabel(room)}
            </div>
          ))}
          {periodRooms.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '32px', color: 'var(--muted)', fontSize: '13px' }}>
              No room data for this period.{!isCurrentPeriod && ' Use "Add Historical Room" to add records.'}
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
          {[
            { color: 'var(--green)', bg: 'rgba(34,197,94,0.2)', label: 'Paid' },
            { color: 'var(--amber)', bg: 'rgba(245,158,11,0.2)', label: 'Pending' },
            { color: 'var(--red)', bg: 'rgba(239,68,68,0.2)', label: 'Overdue' },
            { color: 'var(--muted)', bg: 'rgba(255,255,255,0.1)', label: 'Vacant' },
          ].map(({ color, bg, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: bg, border: `1px solid ${color}` }}></div>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Overdue alert */}
      {overdueRooms.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.05) 100%)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={18} color="var(--red)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: 'var(--red)', fontSize: '14px', marginBottom: '2px' }}>
              {overdueRooms.length} room{overdueRooms.length > 1 ? 's' : ''} overdue — ${lateFee} late fee applies
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{overdueRooms.map(r => `Room ${r.number} (${r.renter})`).join(' · ')}</div>
          </div>
          <button className="sr-btn sr-btn-ghost sr-btn-sm" onClick={() => { setLateFeeInput(String(lateFee)); setEditingLateFee(true); }}>Edit fee</button>
        </div>
      )}

      {showChart && (
        <CollectionChart onClose={() => setShowChart(false)} selectedYear={selectedYear} selectedMonth={selectedMonth}
          isCurrentMonth={isCurrentPeriod} monthlyHistory={monthlyHistory} currentStats={{ collectedUSD, collectedRiel }} />
      )}
      {selectedRoom && (
        <RoomDetailModal room={selectedRoom} onClose={() => setSelectedRoom(null)} onSave={handleSaveRoom} isHistorical={!isCurrentPeriod} />
      )}
      {showAddHistorical && (
        <AddHistoricalRoomModal onClose={() => setShowAddHistorical(false)} onAdd={handleAddHistoricalRoom} />
      )}
    </>
  );
}
