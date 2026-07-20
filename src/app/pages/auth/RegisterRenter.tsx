import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { DbError } from "../../lib/db";

export function RegisterRenter() {
  const navigate = useNavigate();
  const { registerRenter, completeRegisterRenter } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [communityCode, setCommunityCode] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [devCode, setDevCode] = useState('');
  const [error, setError] = useState('');

  const handleSendOtp = () => {
    setError('');
    try {
      const code = registerRenter({ name, phone, communityCode });
      setDevCode(code);
      setStep(2);
    } catch (e) {
      setError(e instanceof DbError ? e.message : 'Something went wrong. Please try again.');
    }
  };

  const handleVerifyOtp = () => {
    setError('');
    try {
      completeRegisterRenter({ name, phone, communityCode, roomNumber }, otp);
      navigate('/renter');
    } catch (e) {
      setError(e instanceof DbError ? e.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="sr-card">
      <div className="sr-card-title">Renter Registration</div>
      <div style={{ marginBottom: '24px', fontSize: '14px', color: 'var(--muted)' }}>
        {step === 1 ? "Register with your phone number to join your landlord's community." : "Enter the verification code sent to your phone."}
      </div>

      {step === 1 ? (
        <>
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

          <div className="sr-form-group">
            <label className="sr-form-label">Community Invite Code</label>
            <input
              className="sr-form-input"
              type="text"
              placeholder="e.g. GRAND-4F2A"
              value={communityCode}
              onChange={(e) => setCommunityCode(e.target.value)}
              style={{ textTransform: 'uppercase' }}
            />
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
              Ask your landlord for their community's invite code.
            </div>
          </div>

          <div className="sr-form-group">
            <label className="sr-form-label">Room Number (optional)</label>
            <input className="sr-form-input" type="text" placeholder="e.g. 101" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
          </div>

          {error && <div style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '8px' }}>{error}</div>}

          <button
            className="sr-btn sr-btn-teal"
            onClick={handleSendOtp}
            style={{ width: '100%', marginTop: '16px' }}
            disabled={!phone || !name || !communityCode}
          >
            Send Verification Code
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
            Verify &amp; Join
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

      {step === 1 && (
        <button
          className="sr-btn sr-btn-ghost"
          onClick={() => navigate('/')}
          style={{ width: '100%', marginTop: '12px' }}
        >
          Back to Login
        </button>
      )}
    </div>
  );
}
