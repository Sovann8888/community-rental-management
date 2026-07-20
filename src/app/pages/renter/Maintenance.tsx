export function RenterMaintenance() {
  return (
    <>
      <div className="sr-page-header">
        <div>
          <div className="sr-page-title">Request Maintenance</div>
          <div className="sr-page-sub">Report issues to your landlord</div>
        </div>
      </div>

      <div className="sr-grid-2">
        <div className="sr-card">
          <div className="sr-card-title">New Request</div>

          <div className="sr-form-group">
            <label className="sr-form-label">Issue Type</label>
            <select className="sr-form-select">
              <option>Plumbing / Water</option>
              <option>Electrical</option>
              <option>Structural / Furniture</option>
              <option>Other</option>
            </select>
          </div>

          <div className="sr-form-group">
            <label className="sr-form-label">Description</label>
            <textarea className="sr-form-textarea" placeholder="Describe the issue..."></textarea>
          </div>

          <div className="sr-form-group">
            <label className="sr-form-label">Urgency</label>
            <select className="sr-form-select">
              <option>Low</option>
              <option>Medium</option>
              <option>High (Emergency)</option>
            </select>
          </div>

          <button className="sr-btn sr-btn-teal" style={{ width: '100%' }} onClick={() => alert('Request sent!')}>
            Submit Request
          </button>
        </div>

        <div className="sr-card">
          <div className="sr-card-title">My Requests</div>
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>
            No active maintenance requests.
          </div>
        </div>
      </div>
    </>
  );
}
