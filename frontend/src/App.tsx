import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout/Layout';
import Onboarding from './pages/reception/onboarding/Onboarding';
import RoomAvailability from './pages/reception/room_availability/RoomAvailability';
import Checkouts from './pages/reception/checkouts/Checkouts';
import Invoice from './pages/reception/invoice/Invoice';
import SwitchRooms from './pages/reception/switch_rooms/SwitchRooms';
import Login from './pages/login/Login';

function App() {
  return (
    <Router>
      <Routes>
        {/* No Layout for Login */}
        <Route path="/" element={<Login />} />

        {/* All other pages wrapped inside Layout */}
        <Route element={<Layout children={undefined} />}>
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
