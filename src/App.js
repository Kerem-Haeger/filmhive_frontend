import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import FilmsPage from "./pages/FilmsPage";
import FilmDetailPage from "./pages/FilmDetailPage";
import MainNavbar from "./components/MainNavbar";

function App() {
  return (
    <Router>
      <MainNavbar />
      <Container className="py-4">
        <Routes>
          <Route path="/" element={<FilmsPage />} />
          <Route path="/films" element={<FilmsPage />} />
          <Route path="/films/:id" element={<FilmDetailPage />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
