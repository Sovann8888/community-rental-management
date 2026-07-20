import { useState } from "react";
import { useLandlord } from "../../context/LandlordContext";

export function Meter() {
  const { rooms, updateRoom } = useLandlord();
  const [selectedRoomId, setSelectedRoomId] = useState<number | ''>('');
  const [newWater, setNewWater] = useState<string>('');
  const [newElectric, setNewElectric] = useState<string>('');
  const [waterRate, setWaterRate] = useState<string>('');
  const [electricRate, setElectricRate] = useState<string>('');
  const [calculated, setCalculated] = useState(false);

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  const handleSelectRoom = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setSelectedRoomId(id);
    setCalculated(false);
    setNewWater('');
    setNewElectric('');
    const room = rooms.find(r => r.id === id);
    if (room) {
      setWaterRate(room.water.rate.toString());
      setElectricRate(room.electric.rate.toString());
    }
  };

  const calculate = () => {
    if (selectedRoom) {
      const waterCurrent = newWater ? Number(newWater) : selectedRoom.water.current;
      const electricCurrent = newElectric ? Number(newElectric) : selectedRoom.electric.current;
      const finalWaterRate = waterRate ? Number(waterRate) : selectedRoom.water.rate;
      const finalElectricRate = electricRate ? Number(electricRate) : selectedRoom.electric.rate;

      updateRoom(selectedRoom.id, {
        water: { ...selectedRoom.water, current: waterCurrent, rate: finalWaterRate },
        electric: { ...selectedRoom.electric, current: electricCurrent, rate: finalElectricRate }
      });
      setCalculated(true);
    }
  };

  const clear = () => {
    setSelectedRoomId('');
    setCalculated(false);
    setNewWater('');
    setNewElectric('');
    setWaterRate('');
    setElectricRate('');
  };

  return (
    <>
      <div className="sr-page-header">
        <div>
          <div className="sr-page-title">Meter Calculator</div>
          <div className="sr-page-sub">Automatic billing calculation linked to room data</div>
        </div>
      </div>

      <div className="sr-grid-2">
        <div className="sr-card">
          <div className="sr-card-title">Enter Meter Readings</div>

          <div className="sr-form-group">
            <label className="sr-form-label">Select Room</label>
            <select className="sr-form-select" value={selectedRoomId} onChange={handleSelectRoom}>
              <option value="">— Choose room —</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>Room {r.number} ({r.renter || 'Vacant'})</option>
              ))}
            </select>
          </div>

          <div className="sr-section-label" style={{ marginTop: '20px' }}>💧 Water Meter</div>
          <div className="sr-form-row">
            <div className="sr-form-group">
              <label className="sr-form-label">Previous Reading</label>
              <input className="sr-form-input" type="number" value={selectedRoom ? selectedRoom.water.previous : ''} readOnly />
            </div>
            <div className="sr-form-group">
              <label className="sr-form-label">New Reading</label>
              <input 
                className="sr-form-input" 
                type="number" 
                value={newWater} 
                onChange={(e) => setNewWater(e.target.value)} 
                placeholder={selectedRoom ? selectedRoom.water.current.toString() : ''}
              />
            </div>
          </div>
          <div className="sr-form-group">
            <label className="sr-form-label">Water Rate (៛ per m³)</label>
            <input
              className="sr-form-input"
              type="number"
              value={waterRate}
              onChange={(e) => setWaterRate(e.target.value)}
              placeholder={selectedRoom ? selectedRoom.water.rate.toString() : ''}
            />
          </div>

          <div className="sr-section-label" style={{ marginTop: '8px' }}>⚡ Electricity Meter</div>
          <div className="sr-form-row">
            <div className="sr-form-group">
              <label className="sr-form-label">Previous Reading</label>
              <input className="sr-form-input" type="number" value={selectedRoom ? selectedRoom.electric.previous : ''} readOnly />
            </div>
            <div className="sr-form-group">
              <label className="sr-form-label">New Reading</label>
              <input 
                className="sr-form-input" 
                type="number" 
                value={newElectric} 
                onChange={(e) => setNewElectric(e.target.value)}
                placeholder={selectedRoom ? selectedRoom.electric.current.toString() : ''}
              />
            </div>
          </div>
          <div className="sr-form-group">
            <label className="sr-form-label">Electricity Rate (៛ per kWh)</label>
            <input
              className="sr-form-input"
              type="number"
              value={electricRate}
              onChange={(e) => setElectricRate(e.target.value)}
              placeholder={selectedRoom ? selectedRoom.electric.rate.toString() : ''}
            />
          </div>

          <div className="sr-form-group">
            <label className="sr-form-label">Monthly Room Rent (USD)</label>
            <input className="sr-form-input" type="number" value={selectedRoom ? selectedRoom.rent : ''} readOnly />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="sr-btn sr-btn-primary" onClick={calculate} disabled={!selectedRoomId}>⚡ Update & Calculate</button>
            <button className="sr-btn sr-btn-ghost" onClick={clear}>Clear</button>
          </div>
        </div>

        <div>
          <div className="sr-card" style={{ marginBottom: '16px' }}>
            <div className="sr-card-title">📋 Calculation Breakdown</div>
            {calculated && selectedRoom ? (
              <div style={{ background: 'rgba(26,92,255,0.08)', border: '1px solid rgba(26,92,255,0.25)', borderRadius: '12px', padding: '20px' }}>
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '4px' }}>Water Calculation</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '14px', background: 'var(--card)', padding: '10px', borderRadius: '8px' }}>
                    {selectedRoom.water.current} - {selectedRoom.water.previous} = {selectedRoom.water.current - selectedRoom.water.previous} m³<br />
                    {selectedRoom.water.current - selectedRoom.water.previous} m³ × {selectedRoom.water.rate} ៛ = <strong style={{color: 'var(--sky)'}}>{((selectedRoom.water.current - selectedRoom.water.previous) * selectedRoom.water.rate).toLocaleString()} ៛</strong>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '4px' }}>Electricity Calculation</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '14px', background: 'var(--card)', padding: '10px', borderRadius: '8px' }}>
                    {selectedRoom.electric.current} - {selectedRoom.electric.previous} = {selectedRoom.electric.current - selectedRoom.electric.previous} kWh<br />
                    {selectedRoom.electric.current - selectedRoom.electric.previous} kWh × {selectedRoom.electric.rate} ៛ = <strong style={{color: 'var(--sky)'}}>{((selectedRoom.electric.current - selectedRoom.electric.previous) * selectedRoom.electric.rate).toLocaleString()} ៛</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: 'var(--muted)' }}>Room Rent (USD)</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--white)', fontWeight: 600 }}>${selectedRoom.rent}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '14px', marginTop: '6px', fontWeight: 700, fontSize: '16px', color: 'var(--sky)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span>Total Due</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "'DM Mono', monospace" }}>${selectedRoom.rent}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '14px', color: 'var(--muted)' }}>
                      + {(((selectedRoom.water.current - selectedRoom.water.previous) * selectedRoom.water.rate) + ((selectedRoom.electric.current - selectedRoom.electric.previous) * selectedRoom.electric.rate)).toLocaleString()} ៛
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🧮</div>
                Select a room and update meter readings to calculate the exact breakdown.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
