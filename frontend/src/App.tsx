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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
