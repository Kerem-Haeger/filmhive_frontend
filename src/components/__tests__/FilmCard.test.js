import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import FilmCard from "../FilmCard";
import { AuthContext } from "../../context/AuthContext";
import { FavoritesContext } from "../../context/FavoritesContext";

// Mock API to avoid axios ESM in Jest
jest.mock("../../services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

function Providers({ children }) {
  const authValue = { isAuthenticated: true };
  const favoritesValue = { toggleFavorite: jest.fn(), isFavorited: () => false };
  return (
    <AuthContext.Provider value={authValue}>
      <FavoritesContext.Provider value={favoritesValue}>{children}</FavoritesContext.Provider>
    </AuthContext.Provider>
  );
}

describe("FilmCard", () => {
  test("renders title, badges, and favorite button", () => {
    const film = {
      id: 1,
      title: "Inception",
      year: 2010,
      critic_score: 8.76,
      match_score: 92.3,
      reasons: ["Sci-Fi", "Nolan"],
      poster_path: "/inception.jpg",
    };

    render(
      <MemoryRouter>
        <Providers>
          <FilmCard film={film} />
        </Providers>
      </MemoryRouter>
    );

    // Title
    expect(screen.getByText("Inception")).toBeInTheDocument();
    // Year subtitle
    expect(screen.getByText("2010")).toBeInTheDocument();
    // Rating badge (formatted to 2 decimals)
    expect(screen.getByText(/rating:\s*8\.76/i)).toBeInTheDocument();
    // Match badge (rounded)
    expect(screen.getByText(/match\s*92%/i)).toBeInTheDocument();
    // Reasons joined
    expect(screen.getByText(/sci-fi \| nolan/i)).toBeInTheDocument();

    // Favorite button is present
    const favButton = screen.getByRole("button", { name: /add to favourites/i });
    expect(favButton).toBeInTheDocument();

    // Poster image alt
    expect(screen.getByAltText(/inception poster/i)).toBeInTheDocument();
  });
});
