import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import FilmsPage from "./pages/FilmsPage";
import FilmDetailPage from "./pages/FilmDetailPage";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<FilmsPage />} />
          <Route path="/films" element={<FilmsPage />} />
          <Route path="/films/:id" element={<FilmDetailPage />} />
          {/* later:
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
