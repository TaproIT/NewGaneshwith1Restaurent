import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Layout from './Layout/Layout';
import Onboarding from './pages/reception/onboarding/Onboarding';
import RoomAvailability from './pages/reception/room_availability/RoomAvailability';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/room-availability" element={<RoomAvailability />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
