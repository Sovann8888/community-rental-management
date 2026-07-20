import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as db from '../lib/db';

interface AuthContextType {
  currentUser: db.UserRecord | undefined;
  community: db.Community | undefined;
  loading: boolean;

  /** Step 1 of registering a new landlord. Throws DbError on duplicate phone. */
  registerLandlord: (data: { name: string; phone: string; communityName: string }) => string;
  /** Step 1 of joining a community as a tenant. Throws DbError on duplicate phone / bad code. */
  registerRenter: (data: { name: string; phone: string; communityCode: string; roomNumber?: string }) => string;
  /** Step 1 of logging back in with an existing phone number. Throws DbError if not found. */
  requestLoginOtp: (phone: string) => string;

  /** Step 2: verify the code for whichever flow was started above, and log the user in. */
  completeRegisterLandlord: (data: { name: string; phone: string; communityName: string }, code: string) => db.UserRecord;
  completeRegisterRenter: (data: { name: string; phone: string; communityCode: string; roomNumber?: string }, code: string) => db.UserRecord;
  completeLogin: (phone: string, code: string) => db.UserRecord;

  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<db.UserRecord | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.ensureFreshDatabase();
    setCurrentUser(db.getCurrentUser());
    setLoading(false);
  }, []);

  const community = currentUser ? db.findCommunityById(currentUser.communityId) : undefined;

  function registerLandlord(data: { name: string; phone: string; communityName: string }) {
    if (db.findUserByPhone(data.phone)) {
      throw new db.DbError('This phone number already has an account. Please log in instead.');
    }
    return db.requestOtp(data.phone, 'register-landlord');
  }

  function registerRenter(data: { name: string; phone: string; communityCode: string; roomNumber?: string }) {
    if (db.findUserByPhone(data.phone)) {
      throw new db.DbError('This phone number already has an account. Please log in instead.');
    }
    if (!db.findCommunityByCode(data.communityCode)) {
      throw new db.DbError('We could not find a community with that invite code.');
    }
    return db.requestOtp(data.phone, 'register-renter');
  }

  function requestLoginOtp(phone: string) {
    const user = db.findUserByPhone(phone);
    if (!user) {
      throw new db.DbError('No account found for this phone number yet. Please register first.');
    }
    return db.requestOtp(phone, 'login');
  }

  function completeRegisterLandlord(data: { name: string; phone: string; communityName: string }, code: string) {
    if (!db.verifyOtp(data.phone, 'register-landlord', code)) {
      throw new db.DbError('Invalid or expired verification code.');
    }
    const user = db.createLandlord(data);
    db.login(user.phone);
    setCurrentUser(user);
    return user;
  }

  function completeRegisterRenter(data: { name: string; phone: string; communityCode: string; roomNumber?: string }, code: string) {
    if (!db.verifyOtp(data.phone, 'register-renter', code)) {
      throw new db.DbError('Invalid or expired verification code.');
    }
    const user = db.joinCommunityAsTenant(data);
    db.login(user.phone);
    setCurrentUser(user);
    return user;
  }

  function completeLogin(phone: string, code: string) {
    if (!db.verifyOtp(phone, 'login', code)) {
      throw new db.DbError('Invalid or expired verification code.');
    }
    const user = db.login(phone);
    if (!user) throw new db.DbError('Account not found.');
    setCurrentUser(user);
    return user;
  }

  function logout() {
    db.logout();
    setCurrentUser(undefined);
  }

  return (
    <AuthContext.Provider value={{
      currentUser, community, loading,
      registerLandlord, registerRenter, requestLoginOtp,
      completeRegisterLandlord, completeRegisterRenter, completeLogin,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
