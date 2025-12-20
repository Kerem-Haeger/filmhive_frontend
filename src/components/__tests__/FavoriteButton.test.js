import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import FavoriteButton from "../FavoriteButton";
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

function renderWithProviders(ui, { isAuthenticated = false, favoritesValue = {} } = {}) {
  const defaultFavorites = {
    toggleFavorite: jest.fn(),
    isFavorited: () => false,
  };

  return render(
    <AuthContext.Provider value={{ isAuthenticated }}>
      <FavoritesContext.Provider value={{ ...defaultFavorites, ...favoritesValue }}>
        {ui}
      </FavoritesContext.Provider>
    </AuthContext.Provider>
  );
}

describe("FavoriteButton", () => {
  test("shows login tooltip and does not toggle when unauthenticated", async () => {
    const toggleFavorite = jest.fn();
    renderWithProviders(<FavoriteButton filmId={123} />, {
      isAuthenticated: false,
      favoritesValue: { toggleFavorite, isFavorited: () => false },
    });

    const button = screen.getByRole("button", { name: /add to favourites/i });
    await userEvent.click(button);

    // Tooltip should be visible
    const tooltip = await screen.findByText(/please log in to favourite this film/i);
    expect(tooltip).toBeInTheDocument();

    // toggleFavorite should not be called
    expect(toggleFavorite).not.toHaveBeenCalled();
  });

  test("toggles favorite when authenticated", async () => {
    const toggleFavorite = jest.fn();
    renderWithProviders(<FavoriteButton filmId={456} />, {
      isAuthenticated: true,
      favoritesValue: { toggleFavorite, isFavorited: () => false },
    });

    // aria-label reflects available action
    const button = screen.getByRole("button", { name: /add to favourites/i });
    await userEvent.click(button);

    expect(toggleFavorite).toHaveBeenCalledWith(456);
  });
});
