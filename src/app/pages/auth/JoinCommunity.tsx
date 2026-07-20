import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Building } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { DbError, findCommunityByCode } from "../../lib/db";

export function JoinCommunity() {
  const navigate = useNavigate();
  const { communityCode: codeFromUrl } = useParams();
  const { registerRenter, completeRegisterRenter } = useAuth();

  const community = codeFromUrl ? findCommunityByCode(codeFromUrl) : undefined;

  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [otp, setOtp] = useState('');
  const [devCode, setDevCode] = useState('');
  const [error, setError] = useState('');

  const handleSendOtp = () => {
    setError('');
    if (!community) {
      setError('This invite link is invalid or the community no longer exists.');
      return;
    }
    try {
      const code = registerRenter({ name, phone, communityCode: community.code });
      setDevCode(code);
      setStep(2);
    } catch (e) {
      setError(e instanceof DbError ? e.message : 'Something went wrong. Please try again.');
    }
  };

  const handleVerifyOtp = () => {
    setError('');
    if (!community) return;
    try {
      completeRegisterRenter({ name, phone, communityCode: community.code, roomNumber: room }, otp);
      navigate('/renter');
    } catch (e) {
      setError(e instanceof DbError ? e.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="sr-card" style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', backgroundColor: 'var(--teal-muted)', borderRadius: '50%', color: 'var(--teal)', marginBottom: '16px' }}>
            <Building size={32} />
          </div>
          <h1 className="sr-card-title">Join Community</h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '8px' }}>
            {community
              ? <>You've been invited to join <strong>{community.name}</strong>.</>
              : "This invite link is invalid or has expired."}
          </p>
        </div>

        {!community ? (
          <button className="sr-btn sr-btn-ghost" onClick={() => navigate('/')} style={{ width: '100%' }}>
            Back to Login
          </button>
        ) : step === 1 ? (
          <>
            <div className="sr-form-group">
              <label className="sr-form-label">Room Number</label>
              <input
                className="sr-form-input"
                type="text"
                placeholder="e.g. 01"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
            </div>

            <div className="sr-form-group">
              <label className="sr-form-label">Phone Number</label>
              <input
                className="sr-form-input"
                type="tel"
                placeholder="+855"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="sr-form-group">
              <label className="sr-form-label">Full Name</label>
              <input className="sr-form-input" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            {error && <div style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '8px' }}>{error}</div>}

            <button
              className="sr-btn sr-btn-teal"
              onClick={handleSendOtp}
              style={{ width: '100%', marginTop: '16px' }}
              disabled={!phone || !room || !name}
            >
              Request to Join
            </button>
          </>
        ) : (
          <>
            <div className="sr-form-group">
              <label className="sr-form-label">Verification Code</label>
              <input
                className="sr-form-input"
                type="text"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
                Demo mode (no SMS gateway connected): your code is <strong>{devCode}</strong>
              </div>
            </div>

            {error && <div style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '8px' }}>{error}</div>}

            <button
              className="sr-btn sr-btn-teal"
              onClick={handleVerifyOtp}
              style={{ width: '100%', marginTop: '16px' }}
              disabled={otp.length < 4}
            >
              Verify &amp; Enter Dashboard
            </button>

            <button
              className="sr-btn sr-btn-ghost"
              onClick={() => { setStep(1); setError(''); }}
              style={{ width: '100%', marginTop: '12px' }}
            >
              Go Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
