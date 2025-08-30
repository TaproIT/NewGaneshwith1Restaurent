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
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/room-availability" element={<RoomAvailability />} />
          <Route path="/switch-rooms" element={<SwitchRooms />} />
          <Route path="/checkouts" element={<Checkouts />} />
          <Route path="/invoice" element={<Invoice />} />

          <Route path="/beach-restaurant/home" element={<BeachRestaurantHomePage />} />
          <Route path="/beach-restaurant/tables" element={<BeachRestaurantTablesPage />} />
        </Route>
        <Route path="/beach-restaurant/menu" element={<BeachRestaurantMenuPage />} />
      </Routes> 
    </Router>
  );
}

export default App;
