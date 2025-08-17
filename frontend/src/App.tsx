import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Layout from './Layout/Layout';
import Onboarding from './pages/reception/onboarding/Onboarding';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
