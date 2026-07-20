import { Droplet, Zap, Wallet, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getHistoryForPhone } from "../../lib/db";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function RenterHistory() {
  const { currentUser } = useAuth();
  const { usage, payments } = currentUser ? getHistoryForPhone(currentUser.phone) : { usage: [], payments: [] };

  return (
    <>
      <div className="sr-page-header">
        <div>
          <div className="sr-page-title">My History</div>
          <div className="sr-page-sub">Everything you've submitted or paid, in one place</div>
        </div>
      </div>

      <div className="sr-grid-2">
        <div className="sr-card">
          <div className="sr-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={16} /> Payment History
          </div>

          {payments.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: '14px', padding: '24px 0', textAlign: 'center' }}>
              No payments recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {payments.map(p => (
                <div key={p.id} style={{ background: 'var(--card2)', borderRadius: '12px', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{p.description}</span>
                    <span className={`sr-badge ${p.status === 'Paid' ? 'sr-badge-paid' : p.status === 'Overdue' ? 'sr-badge-overdue' : 'sr-badge-pending'}`}>
                      {p.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                      <Clock size={11} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                      {formatDate(p.paidAt)} at {formatTime(p.paidAt)}
                    </span>
                    <span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--white)' }}>
                      ${p.amountUSD}{p.amountRiel ? ` + ${p.amountRiel.toLocaleString()} ៛` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sr-card">
          <div className="sr-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Droplet size={16} /> Meter Reading History
          </div>

          {usage.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: '14px', padding: '24px 0', textAlign: 'center' }}>
              No meter readings submitted yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {usage.map(u => (
                <div key={u.id} style={{ background: 'var(--card2)', borderRadius: '12px', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {u.type === 'water' ? <Droplet size={13} color="var(--sky)" /> : <Zap size={13} color="var(--amber)" />}
                      {u.type === 'water' ? 'Water Meter' : 'Electric Meter'}
                    </span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>
                      {u.current} {u.type === 'water' ? 'm³' : 'kWh'}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    <Clock size={11} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                    {formatDate(u.submittedAt)} at {formatTime(u.submittedAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
