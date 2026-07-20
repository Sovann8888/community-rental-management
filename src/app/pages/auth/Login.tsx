import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { DbError } from "../../lib/db";

export function Login() {
  const navigate = useNavigate();
  const { requestLoginOtp, completeLogin } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [devCode, setDevCode] = useState('');
  const [error, setError] = useState('');

  const handleSendOtp = () => {
    setError('');
    try {
      const code = requestLoginOtp(phone);
      setDevCode(code);
      setStep(2);
    } catch (e) {
      setError(e instanceof DbError ? e.message : 'Something went wrong. Please try again.');
    }
  };

  const handleVerifyOtp = () => {
    setError('');
    try {
      const user = completeLogin(phone, otp);
      navigate(user.role === 'landlord' ? '/landlord' : '/renter');
    } catch (e) {
      setError(e instanceof DbError ? e.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="sr-card">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="sr-logo-mark" style={{ fontSize: '28px', marginBottom: '8px' }}>Smart-<span>Rent</span>House</div>
        <div className="sr-logo-sub">Property Management</div>
      </div>

      <div className="sr-card-title" style={{ textAlign: 'center' }}>Welcome back</div>

      {step === 1 ? (
        <>
          <div className="sr-form-group" style={{ marginTop: '16px' }}>
            <label className="sr-form-label">Phone Number</label>
            <input
              className="sr-form-input"
              type="tel"
              placeholder="+855 12 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {error && <div style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '8px' }}>{error}</div>}

          <button
            className="sr-btn sr-btn-primary"
            onClick={handleSendOtp}
            style={{ width: '100%', marginTop: '8px' }}
            disabled={!phone}
          >
            Log In with OTP
          </button>

          <div style={{ margin: '24px 0', textAlign: 'center', fontSize: '12px', color: 'var(--muted)' }}>
            New here? Create an account:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              className="sr-btn sr-btn-ghost"
              onClick={() => navigate('/register-landlord')}
              style={{ width: '100%' }}
            >
              I am a Landlord
            </button>
            <button
              className="sr-btn sr-btn-ghost"
              onClick={() => navigate('/register-renter')}
              style={{ width: '100%' }}
            >
              I am a Renter
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ marginBottom: '20px', fontSize: '14px', color: 'var(--muted)', marginTop: '16px' }}>
            Enter the verification code sent to {phone}.
          </div>

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
            Verify &amp; Log In
          </button>

          <button
            className="sr-btn sr-btn-ghost"
            onClick={() => { setStep(1); setOtp(''); setError(''); }}
            style={{ width: '100%', marginTop: '12px' }}
          >
            Go Back
          </button>
        </>
      )}
    </div>
  );
}
