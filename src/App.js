import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import FilmsPage from "./pages/FilmsPage";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<FilmsPage />} />
          <Route path="/films" element={<FilmsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
