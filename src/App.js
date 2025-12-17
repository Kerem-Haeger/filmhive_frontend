import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import FilmsPage from "./pages/FilmsPage";
import FilmDetailPage from "./pages/FilmDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FavoritesPage from "./pages/FavoritesPage";
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { NotificationProvider } from "./context/NotificationContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <FavoritesProvider>
            <Layout>
            <Routes>
              <Route path="/" element={<FilmsPage />} />
              <Route path="/films" element={<FilmsPage />} />
              <Route path="/films/:id" element={<FilmDetailPage />} />
              <Route path="/favourites" element={<FavoritesPage />} />

              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
            </Layout>
          </FavoritesProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
