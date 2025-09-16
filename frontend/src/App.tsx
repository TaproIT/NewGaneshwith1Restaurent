import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout/Layout";
import Onboarding from "./pages/reception/onboarding/Onboarding";
import RoomAvailability from "./pages/reception/room_availability/RoomAvailability";
import Checkouts from "./pages/reception/checkouts/Checkouts";
import Invoice from "./pages/reception/invoice/Invoice";
import SwitchRooms from "./pages/reception/switch_rooms/SwitchRooms";
import Login from "./pages/login/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./component/ProtectedRoute";
import BeachRestaurantHomePage from './pages/beach-restaurant/BeachRestaurantHomePage';
import BeachRestaurantTablesPage from './pages/beach-restaurant/BeachRestaurantTablesPage';
import BeachRestaurantMenuPage from './pages/beach-restaurant/BeachRestaurantMenuPage';
import BeachRestaurantHoldPage from "./pages/beach-restaurant/BeachRestaurantHoldPage";
import BeachRestaurantDailySummaryPage from "./pages/beach-restaurant/BeachRestaurantDailySummaryPage";
import Dashboard from "./pages/admin/beverage_inventory/Dashboard";
import ManageInventory from "./pages/admin/beverage_inventory/ManageInventory";
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/" element={<Login />} />

        {/* All other pages wrapped inside Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/room-availability" element={<RoomAvailability />} />
          <Route path="/switch-rooms" element={<SwitchRooms />} />
          <Route path="/checkouts" element={<Checkouts />} />
          <Route path="/invoice" element={<Invoice />} />

          <Route path="/restaurant/home" element={<BeachRestaurantHomePage />} />
          <Route path="/restaurant/tables/:id" element={<BeachRestaurantTablesPage />} />
          <Route path="/restaurant/menu/:id" element={<BeachRestaurantMenuPage />} />
          <Route path="/restaurant/hold" element={<BeachRestaurantHoldPage />} />
          <Route path="/restaurant/daily-summary" element={<BeachRestaurantDailySummaryPage />} />
         
          <Route path="/beverage-inventory/dashboard" element={<Dashboard />} />
          <Route path="/beverage-inventory/manage-inventory" element={<ManageInventory />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
        {/* <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} /> */}
      </Routes>
    </Router>
  );
}

export default App;
