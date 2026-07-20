import { createBrowserRouter, Navigate } from "react-router";
import { AuthLayout } from "./layouts/AuthLayout";
import { LandlordLayout } from "./layouts/LandlordLayout";
import { RenterLayout } from "./layouts/RenterLayout";
import { RequireRole } from "./components/RequireRole";

import { Login } from "./pages/auth/Login";
import { RegisterLandlord } from "./pages/auth/RegisterLandlord";
import { RegisterRenter } from "./pages/auth/RegisterRenter";
import { JoinCommunity } from "./pages/auth/JoinCommunity";

import { LandlordDashboard } from "./pages/landlord/Dashboard";
import { Rooms } from "./pages/landlord/Rooms";
import { Meter } from "./pages/landlord/Meter";
import { Invoice } from "./pages/landlord/Invoice";
import { Payment } from "./pages/landlord/Payment";
import { LandlordMaintenance } from "./pages/landlord/Maintenance";

import { RenterDashboard } from "./pages/renter/Dashboard";
import { RenterMeter } from "./pages/renter/Meter";
import { RenterMaintenance } from "./pages/renter/Maintenance";
import { RenterHistory } from "./pages/renter/History";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { index: true, element: <Login /> },
      { path: "register-landlord", element: <RegisterLandlord /> },
      { path: "register-renter", element: <RegisterRenter /> },
    ],
  },
  {
    path: "/join/:communityCode",
    element: <JoinCommunity />
  },
  {
    path: "/landlord",
    element: <RequireRole role="landlord"><LandlordLayout /></RequireRole>,
    children: [
      { index: true, element: <LandlordDashboard /> },
      { path: "rooms", element: <Rooms /> },
      { path: "meter", element: <Meter /> },
      { path: "invoice", element: <Invoice /> },
      { path: "payment", element: <Payment /> },
      { path: "maintenance", element: <LandlordMaintenance /> },
    ],
  },
  {
    path: "/renter",
    element: <RequireRole role="renter"><RenterLayout /></RequireRole>,
    children: [
      { index: true, element: <RenterDashboard /> },
      { path: "meter", element: <RenterMeter /> },
      { path: "maintenance", element: <RenterMaintenance /> },
      { path: "history", element: <RenterHistory /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  }
]);
