import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import FilmsPage from "./pages/FilmsPage";
import FilmDetailPage from "./pages/FilmDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FavoritesPage from "./pages/FavoritesPage";
import WatchlistsPage from "./pages/WatchlistsPage";
import ForYouPage from "./pages/ForYouPage";
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { NotificationProvider } from "./context/NotificationContext";
import { WatchlistsProvider } from "./context/WatchlistsContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <FavoritesProvider>
            <WatchlistsProvider>
              <Layout>
              <Routes>
                <Route path="/" element={<FilmsPage />} />
                <Route path="/films" element={<FilmsPage />} />
                <Route path="/films/:id" element={<FilmDetailPage />} />
                <Route path="/for-you" element={<ForYouPage />} />
                <Route path="/favourites" element={<FavoritesPage />} />
                <Route path="/watchlists" element={<WatchlistsPage />} />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Routes>
              </Layout>
            </WatchlistsProvider>
          </FavoritesProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
