import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as db from '../lib/db';
import { useAuth } from './AuthContext';

export type PaymentStatus = db.PaymentStatus;
export type Room = db.Room;

export type MonthSnapshot = {
  rooms: Room[];
  collectedUSD: number;
  collectedRiel: number;
};

interface LandlordContextType {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  updateRoom: (id: number, updatedRoom: Partial<Room>) => void;
  addRoom: (room: Omit<Room, 'id'>) => void;
  communityName: string;
  setCommunityName: (name: string) => void;
  inviteCode: string;
  lateFee: number;
  setLateFee: (fee: number) => void;
  monthlyHistory: { [key: string]: MonthSnapshot };
  setMonthlyHistory: React.Dispatch<React.SetStateAction<{ [key: string]: MonthSnapshot }>>;
}

const LandlordContext = createContext<LandlordContextType | undefined>(undefined);

export function LandlordProvider({ children }: { children: ReactNode }) {
  const { currentUser, community } = useAuth();
  const communityId = currentUser?.communityId ?? '';

  const [rooms, setRoomsState] = useState<Room[]>(() => db.getRooms(communityId));
  const [lateFee, setLateFee] = useState(community?.lateFee ?? 5);
  const [monthlyHistory, setMonthlyHistory] = useState<{ [key: string]: MonthSnapshot }>({});

  // Reload rooms whenever the logged-in landlord's community changes.
  useEffect(() => {
    setRoomsState(db.getRooms(communityId));
  }, [communityId]);

  // Persist any room changes back into the local database.
  const setRooms: React.Dispatch<React.SetStateAction<Room[]>> = (value) => {
    setRoomsState(prev => {
      const next = typeof value === 'function' ? (value as (p: Room[]) => Room[])(prev) : value;
      if (communityId) db.saveRooms(communityId, next);
      return next;
    });
  };

  const updateRoom = (id: number, updatedRoom: Partial<Room>) => {
    setRooms(prevRooms => prevRooms.map(r => r.id === id ? { ...r, ...updatedRoom } : r));
  };

  const addRoom = (room: Omit<Room, 'id'>) => {
    setRooms(prevRooms => {
      const nextId = prevRooms.length ? Math.max(...prevRooms.map(r => r.id)) + 1 : 1;
      return [...prevRooms, { ...room, id: nextId }];
    });
  };

  return (
    <LandlordContext.Provider value={{
      rooms, setRooms, updateRoom, addRoom,
      communityName: community?.name ?? '',
      setCommunityName: () => {}, // community name is set at registration time
      inviteCode: community?.code ?? '',
      lateFee, setLateFee,
      monthlyHistory, setMonthlyHistory
    }}>
      {children}
    </LandlordContext.Provider>
  );
}

export function useLandlord() {
  const context = useContext(LandlordContext);
  if (context === undefined) {
    throw new Error('useLandlord must be used within a LandlordProvider');
  }
  return context;
}
