import { useState, useMemo } from "react";
import { Plus, Trash2, Edit2, Link, Copy, X } from "lucide-react";
import { useLandlord, Room } from "../../context/LandlordContext";

function inviteUrlFor(code: string) {
  return `${window.location.origin}/join/${code}`;
}

const FLOOR_LABELS: Record<string, string> = {
  G: 'G Floor', '1': '1st Floor', '2': '2nd Floor', '3': '3rd Floor',
  '4': '4th Floor', '5': '5th Floor', '6': '6th Floor', '7': '7th Floor',
  '8': '8th Floor', '9': '9th Floor', '10': '10th Floor'
};

export function Rooms() {
  const { rooms, setRooms, updateRoom, inviteCode } = useLandlord();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeFloor, setActiveFloor] = useState<string>('all');
  const [customFloors, setCustomFloors] = useState<string[]>([]);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Room | null>(null);

  // Helper function to calculate next due date
  const getNextDueDate = (dueDay: number) => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let nextMonth = currentMonth;
    let nextYear = currentYear;

    if (currentDay >= dueDay) {
      nextMonth = currentMonth + 1;
      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear = currentYear + 1;
      }
    }

    const nextDue = new Date(nextYear, nextMonth, Math.min(dueDay, new Date(nextYear, nextMonth + 1, 0).getDate()));
    return nextDue;
  };

  // Helper function to get notification date (3 days before due)
  const getNotificationDate = (dueDay: number) => {
    const dueDate = getNextDueDate(dueDay);
    const notifDate = new Date(dueDate);
    notifDate.setDate(notifDate.getDate() - 3);
    return notifDate;
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Check if today is notification day for a room
  const isNotificationDay = (dueDay: number) => {
    const today = new Date();
    const notifDate = getNotificationDate(dueDay);
    return today.getDate() === notifDate.getDate() && today.getMonth() === notifDate.getMonth();
  };

  // Get rooms that need notifications today
  const roomsNeedingNotification = rooms.filter(r => r.status === 'Occupied' && isNotificationDay(r.dueDay));

  const addRoom = () => {
    const floorToSet = activeFloor !== 'all' ? activeFloor : 'G';
    setRooms([...rooms, {
      id: Date.now(),
      number: '',
      floor: floorToSet,
      renter: 'Vacant',
      rent: 60,
      status: 'Vacant',
      phone: '',
      water: { previous: 0, current: 0, rate: 2500 },
      electric: { previous: 0, current: 0, rate: 1000 },
      paymentStatus: 'N/A',
      problem: '',
      dueDay: 24
    }]);
  };

  const removeRoom = (id: number) => {
    setRooms(rooms.filter(r => r.id !== id));
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteUrlFor(inviteCode));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openRoomDetails = (room: Room) => {
    setSelectedRoom(room);
    setEditMode(false);
  };

  const startEdit = () => {
    if (selectedRoom) {
      setEditForm({ ...selectedRoom });
      setEditMode(true);
    }
  };

  const handleSaveEdit = () => {
    if (editForm) {
      updateRoom(editForm.id, editForm);
      setSelectedRoom(editForm);
      setEditMode(false);
    }
  };

  // Derive unique floors present in rooms + any custom floors added
  const presentFloors = useMemo(() => {
    const floorsInRooms = Array.from(new Set(rooms.map(r => r.floor)));
    const all = Array.from(new Set([...floorsInRooms, ...customFloors]));
    return all.sort((a, b) => {
      const order = ['G', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
      return order.indexOf(a) - order.indexOf(b);
    });
  }, [rooms, customFloors]);

  const filteredRooms = activeFloor === 'all' ? rooms : rooms.filter(r => r.floor === activeFloor);

  const handleAddFloor = () => {
    const existing = ['G', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const allFloors = Array.from(new Set([...presentFloors, ...existing]));
    const nextFloor = allFloors.find(f => !presentFloors.includes(f));
    if (nextFloor) {
      setCustomFloors(prev => [...prev, nextFloor]);
      setActiveFloor(nextFloor);
    }
  };

  return (
    <>
      <div className="sr-page-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="sr-page-title">All Rooms</div>
          <div className="sr-page-sub">{rooms.length} rooms managed</div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="sr-btn sr-btn-ghost" onClick={() => setInviteModalOpen(true)}>
            <Link size={16} /> Invite Renters
          </button>
          <button className="sr-btn sr-btn-primary" onClick={addRoom}>
            <Plus size={16} /> Add Room
          </button>
        </div>
      </div>

      {/* Floor Filter Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveFloor('all')}
          style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: activeFloor === 'all' ? 700 : 400, cursor: 'pointer', border: 'none', background: activeFloor === 'all' ? 'var(--blue)' : 'var(--card2)', color: activeFloor === 'all' ? '#fff' : 'var(--muted)', transition: 'all 0.15s' }}
        >All Rooms</button>
        {presentFloors.map(floor => (
          <button key={floor} onClick={() => setActiveFloor(floor)}
            style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: activeFloor === floor ? 700 : 400, cursor: 'pointer', border: 'none', background: activeFloor === floor ? 'var(--blue)' : 'var(--card2)', color: activeFloor === floor ? '#fff' : 'var(--muted)', transition: 'all 0.15s' }}
          >{FLOOR_LABELS[floor] ?? `${floor}F`}</button>
        ))}
        <button onClick={handleAddFloor}
          style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', border: '1px dashed rgba(255,255,255,0.25)', background: 'transparent', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.15s' }}
          title="Add a new floor filter"
        ><Plus size={12} /> Add Floor</button>
        <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: 'auto' }}>
          {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} {activeFloor !== 'all' ? `on ${FLOOR_LABELS[activeFloor] ?? activeFloor}` : 'total'}
        </span>
      </div>

      {roomsNeedingNotification.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(26,92,255,0.15) 0%, rgba(147,51,234,0.15) 100%)',
          border: '1px solid rgba(26,92,255,0.3)',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ fontSize: '24px' }}>🔔</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--white)' }}>
              Notification Reminder
            </div>
            <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
              Send meter reading reminders to: {roomsNeedingNotification.map(r => `${r.renter} (Room ${r.number})`).join(', ')}
            </div>
          </div>
        </div>
      )}

      <div className="sr-card">
        <div className="sr-card-title">Room Directory</div>
        <div className="sr-table-wrap">
          <table className="sr-table">
            <thead><tr>
              <th>Room</th><th>Floor</th><th>Renter</th><th>Rent ($)</th><th>Status</th><th>Action</th>
            </tr></thead>
            <tbody>
              {filteredRooms.map(room => (
                <tr key={room.id} onClick={() => openRoomDetails(room)} style={{ cursor: 'pointer' }}>
                  <td><b>{room.number || <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>—</span>}</b></td>
                  <td>{room.floor}</td>
                  <td style={{ color: room.renter === 'Vacant' ? 'var(--muted)' : 'inherit' }}>{room.renter}</td>
                  <td style={{ fontFamily: "'DM Mono', monospace" }}>${room.rent}</td>
                  <td>
                    {room.status === 'Vacant' ? (
                      <span className="sr-badge sr-badge-pending">Vacant</span>
                    ) : room.paymentStatus === 'Paid' ? (
                      <span className="sr-badge sr-badge-paid">Paid</span>
                    ) : room.paymentStatus === 'Pending' ? (
                      <span className="sr-badge" style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,0.3)' }}>Pending</span>
                    ) : room.paymentStatus === 'Overdue' ? (
                      <span className="sr-badge sr-badge-overdue">Overdue</span>
                    ) : (
                      <span className="sr-badge sr-badge-pending">Occupied</span>
                    )}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button className="sr-btn sr-btn-danger sr-btn-sm" onClick={() => removeRoom(room.id)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRooms.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
              {activeFloor === 'all' ? 'No rooms added yet.' : `No rooms on ${FLOOR_LABELS[activeFloor] ?? activeFloor}.`}
            </div>
          )}
        </div>
      </div>

      {inviteModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(5px)'
        }}>
          <div className="sr-card" style={{ width: '400px', maxWidth: '90%', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div className="sr-card-title">Invite Renters</div>
              <button className="sr-btn sr-btn-ghost sr-btn-sm" style={{ padding: '4px' }} onClick={() => setInviteModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '16px' }}>
              Share this link (or just the code <strong>{inviteCode}</strong>) with your renters so they can register and join your community.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              <input 
                className="sr-form-input" 
                readOnly 
                value={inviteUrlFor(inviteCode)} 
                style={{ flex: 1, backgroundColor: 'var(--card2)' }}
              />
              <button className="sr-btn sr-btn-primary" onClick={handleCopyInvite}>
                {copied ? 'Copied!' : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedRoom && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(5px)'
        }}>
          <div className="sr-card" style={{ width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div className="sr-card-title" style={{ margin: 0 }}>Room {selectedRoom.number} Details</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {!editMode ? (
                  <button className="sr-btn sr-btn-ghost sr-btn-sm" onClick={startEdit}>
                    <Edit2 size={16} /> Edit
                  </button>
                ) : (
                  <button className="sr-btn sr-btn-primary sr-btn-sm" onClick={handleSaveEdit}>
                    Save
                  </button>
                )}
                <button className="sr-btn sr-btn-ghost sr-btn-sm" style={{ padding: '4px' }} onClick={() => { setSelectedRoom(null); setEditMode(false); }}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {!editMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', marginBottom: '4px' }}>Renter Profile</div>
                    <div style={{ fontWeight: 600, fontSize: '16px' }}>{selectedRoom.renter}</div>
                    <div style={{ fontSize: '14px', color: 'var(--muted)' }}>{selectedRoom.phone || 'No phone number'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', marginBottom: '4px' }}>Rent Fee</div>
                    <div style={{ fontWeight: 500, fontSize: '16px', fontFamily: "'DM Mono', monospace" }}>${selectedRoom.rent}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ backgroundColor: 'var(--card2)', padding: '16px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--sky)', marginBottom: '12px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em' }}>WATER METER (៛)</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--muted)' }}>Previous:</span> <span style={{ fontFamily: "'DM Mono', monospace" }}>{selectedRoom.water.previous}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--muted)' }}>Current:</span> <span style={{ fontFamily: "'DM Mono', monospace" }}>{selectedRoom.water.current}</span>
                    </div>
                  </div>
                  
                  <div style={{ backgroundColor: 'var(--card2)', padding: '16px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--amber)', marginBottom: '12px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em' }}>ELECTRIC METER (៛)</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--muted)' }}>Previous:</span> <span style={{ fontFamily: "'DM Mono', monospace" }}>{selectedRoom.electric.previous}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: 'var(--muted)' }}>Current:</span> <span style={{ fontFamily: "'DM Mono', monospace" }}>{selectedRoom.electric.current}</span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', marginBottom: '8px' }}>Payment Status</div>
                      <div>
                        {selectedRoom.paymentStatus === 'Paid' ? (
                          <span className="sr-badge sr-badge-paid">Paid</span>
                        ) : selectedRoom.paymentStatus === 'Unpaid' ? (
                          <span className="sr-badge sr-badge-overdue">Unpaid</span>
                        ) : (
                          <span className="sr-badge sr-badge-pending">N/A</span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', marginBottom: '8px' }}>Next Due Date</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--sky)' }}>
                        {formatDate(getNextDueDate(selectedRoom.dueDay))}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                        Notify: {formatDate(getNotificationDate(selectedRoom.dueDay))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', marginBottom: '8px' }}>Maintenance</div>
                    <div style={{ fontSize: '13px', color: selectedRoom.problem ? 'var(--red)' : 'var(--muted)', lineHeight: 1.4 }}>
                      {selectedRoom.problem || 'No issues reported'}
                    </div>
                  </div>
                </div>
              </div>
            ) : editForm ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                <div className="sr-form-row">
                  <div className="sr-form-group">
                    <label className="sr-form-label">Room Number</label>
                    <input
                      className="sr-form-input"
                      value={editForm.number}
                      placeholder="e.g. 001, 111, 218"
                      onChange={(e) => setEditForm({...editForm, number: e.target.value})}
                    />
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                      Format: floor digit + room digits (001=GF rm1, 218=2F rm18)
                    </div>
                  </div>
                  <div className="sr-form-group">
                    <label className="sr-form-label">Floor</label>
                    <select className="sr-form-select" value={editForm.floor} onChange={(e) => setEditForm({...editForm, floor: e.target.value})}>
                      <option value="G">Ground Floor (G)</option>
                      <option value="1">1st Floor</option>
                      <option value="2">2nd Floor</option>
                      <option value="3">3rd Floor</option>
                      <option value="4">4th Floor</option>
                      <option value="5">5th Floor</option>
                      <option value="6">6th Floor</option>
                      <option value="7">7th Floor</option>
                      <option value="8">8th Floor</option>
                      <option value="9">9th Floor</option>
                      <option value="10">10th Floor</option>
                    </select>
                  </div>
                </div>
                <div className="sr-form-row">
                  <div className="sr-form-group">
                    <label className="sr-form-label">Renter Name</label>
                    <input
                      className="sr-form-input"
                      value={editForm.renter}
                      onChange={(e) => setEditForm({...editForm, renter: e.target.value, status: e.target.value && e.target.value !== 'Vacant' ? 'Occupied' : 'Vacant'})}
                    />
                  </div>
                  <div className="sr-form-group">
                    <label className="sr-form-label">Phone Number</label>
                    <input className="sr-form-input" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} />
                  </div>
                </div>

                <div className="sr-form-row">
                  <div className="sr-form-group">
                    <label className="sr-form-label">Payment Due Day</label>
                    <input
                      className="sr-form-input"
                      type="number"
                      min="1"
                      max="31"
                      value={editForm.dueDay}
                      onChange={(e) => setEditForm({...editForm, dueDay: Math.min(31, Math.max(1, Number(e.target.value)))})}
                    />
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>Day of month (1-31)</div>
                  </div>
                </div>

                <div className="sr-form-group">
                  <label className="sr-form-label">Rent Fee (USD)</label>
                  <input className="sr-form-input" type="number" value={editForm.rent} onChange={(e) => setEditForm({...editForm, rent: Number(e.target.value)})} />
                </div>

                <div className="sr-section-label" style={{ marginTop: '12px' }}>💧 Water Meter</div>
                <div className="sr-form-row">
                  <div className="sr-form-group">
                    <label className="sr-form-label">Water Previous</label>
                    <input type="number" className="sr-form-input" value={editForm.water.previous} onChange={(e) => setEditForm({...editForm, water: {...editForm.water, previous: Number(e.target.value)}})} />
                  </div>
                  <div className="sr-form-group">
                    <label className="sr-form-label">Water Current</label>
                    <input type="number" className="sr-form-input" value={editForm.water.current} onChange={(e) => setEditForm({...editForm, water: {...editForm.water, current: Number(e.target.value)}})} />
                  </div>
                </div>
                <div className="sr-form-group">
                  <label className="sr-form-label">Water Rate (៛ per m³)</label>
                  <input type="number" className="sr-form-input" value={editForm.water.rate} onChange={(e) => setEditForm({...editForm, water: {...editForm.water, rate: Number(e.target.value)}})} />
                </div>

                <div className="sr-section-label" style={{ marginTop: '12px' }}>⚡ Electricity Meter</div>
                <div className="sr-form-row">
                  <div className="sr-form-group">
                    <label className="sr-form-label">Electric Previous</label>
                    <input type="number" className="sr-form-input" value={editForm.electric.previous} onChange={(e) => setEditForm({...editForm, electric: {...editForm.electric, previous: Number(e.target.value)}})} />
                  </div>
                  <div className="sr-form-group">
                    <label className="sr-form-label">Electric Current</label>
                    <input type="number" className="sr-form-input" value={editForm.electric.current} onChange={(e) => setEditForm({...editForm, electric: {...editForm.electric, current: Number(e.target.value)}})} />
                  </div>
                </div>
                <div className="sr-form-group">
                  <label className="sr-form-label">Electricity Rate (៛ per kWh)</label>
                  <input type="number" className="sr-form-input" value={editForm.electric.rate} onChange={(e) => setEditForm({...editForm, electric: {...editForm.electric, rate: Number(e.target.value)}})} />
                </div>

                <div className="sr-form-group">
                  <label className="sr-form-label">Payment Status</label>
                  <select className="sr-form-select" value={editForm.paymentStatus} onChange={(e) => setEditForm({...editForm, paymentStatus: e.target.value as any})}>
                    <option value="Paid">Paid (confirmed)</option>
                    <option value="Pending">Pending (receipt uploaded, awaiting verify)</option>
                    <option value="Overdue">Overdue (past due, no payment)</option>
                    <option value="N/A">N/A (vacant or not started)</option>
                  </select>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
