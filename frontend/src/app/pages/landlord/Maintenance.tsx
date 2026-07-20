import { useLandlord } from "../../context/LandlordContext";

export function LandlordMaintenance() {
  const { rooms, updateRoom } = useLandlord();

  const roomsWithIssues = rooms.filter(r => r.problem);

  const resolveIssue = (roomId: number) => {
    updateRoom(roomId, { problem: '' });
  };

  return (
    <>
      <div className="sr-page-header">
        <div>
          <div className="sr-page-title">Maintenance Requests</div>
          <div className="sr-page-sub">Track and manage repair requests from renters</div>
        </div>
      </div>

      <div className="sr-grid-3" style={{ marginBottom: '24px' }}>
        <div className="sr-stat-card red">
          <div className="sr-stat-icon red">📋</div>
          <div className="sr-stat-value">{roomsWithIssues.length}</div>
          <div className="sr-stat-label">Open requests</div>
        </div>
        <div className="sr-stat-card amber">
          <div className="sr-stat-icon amber">🔨</div>
          <div className="sr-stat-value">0</div>
          <div className="sr-stat-label">In progress</div>
        </div>
        <div className="sr-stat-card teal">
          <div className="sr-stat-icon teal">✅</div>
          <div className="sr-stat-value">12</div>
          <div className="sr-stat-label">Resolved this month</div>
        </div>
      </div>

      <div className="sr-card">
        <div className="sr-card-title">All Requests</div>
        <div className="sr-table-wrap">
          <table className="sr-table">
            <thead><tr>
              <th>Room</th><th>Renter</th><th>Issue</th><th>Status</th><th>Action</th>
            </tr></thead>
            <tbody>
              {roomsWithIssues.map(room => (
                <tr key={room.id}>
                  <td><b>Room {room.number}</b></td>
                  <td>{room.renter}</td>
                  <td>{room.problem}</td>
                  <td><span className="sr-badge sr-badge-open">Open</span></td>
                  <td>
                    <button className="sr-btn sr-btn-sm sr-btn-primary" onClick={() => resolveIssue(room.id)}>
                      Mark Resolved
                    </button>
                  </td>
                </tr>
              ))}
              {roomsWithIssues.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                    No maintenance issues reported right now.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
