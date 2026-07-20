import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { DbError } from "../../lib/db";

export function RegisterLandlord() {
  const navigate = useNavigate();
  const { registerLandlord, completeRegisterLandlord } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [communityName, setCommunityName] = useState('');
  const [otp, setOtp] = useState('');
  const [devCode, setDevCode] = useState('');
  const [error, setError] = useState('');

  const handleSendOtp = () => {
    setError('');
    try {
      const code = registerLandlord({ name, phone, communityName });
      setDevCode(code);
      setStep(2);
    } catch (e) {
      setError(e instanceof DbError ? e.message : 'Something went wrong. Please try again.');
    }
  };

  const handleVerifyOtp = () => {
    setError('');
    try {
      completeRegisterLandlord({ name, phone, communityName }, otp);
      navigate('/landlord');
    } catch (e) {
      setError(e instanceof DbError ? e.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="sr-card">
      <div className="sr-card-title">Landlord Registration</div>
      <div style={{ marginBottom: '24px', fontSize: '14px', color: 'var(--muted)' }}>
        {step === 1 ? "Create your community and start managing your properties." : "Enter the verification code sent to your phone."}
      </div>

      {step === 1 ? (
        <>
          <div className="sr-form-group">
            <label className="sr-form-label">Full Name</label>
            <input className="sr-form-input" type="text" placeholder="Soksovann" value={name} onChange={(e) => setName(e.target.value)} />
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
            <label className="sr-form-label">Community / Building Name</label>
            <input className="sr-form-input" type="text" placeholder="e.g. Soksovann Apartments" value={communityName} onChange={(e) => setCommunityName(e.target.value)} />
          </div>

          {error && <div style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '8px' }}>{error}</div>}

          <button
            className="sr-btn sr-btn-primary"
            onClick={handleSendOtp}
            style={{ width: '100%', marginTop: '16px' }}
            disabled={!phone || !name || !communityName}
          >
            Send Verification Code
          </button>

          <button
            className="sr-btn sr-btn-ghost"
            onClick={() => navigate('/')}
            style={{ width: '100%', marginTop: '12px' }}
          >
            Back
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
            className="sr-btn sr-btn-primary"
            onClick={handleVerifyOtp}
            style={{ width: '100%', marginTop: '16px' }}
            disabled={otp.length < 4}
          >
            Verify &amp; Create Community
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
  );
}
