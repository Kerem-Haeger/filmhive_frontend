import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import SearchBar from "../SearchBar";

describe("SearchBar", () => {
  test("shows Clear button when term present and calls onClear", async () => {
    const onClear = jest.fn();
    render(
      <SearchBar
        searchTerm="matrix"
        onSearchChange={jest.fn()}
        onClear={onClear}
        resultCount={5}
        totalCount={20}
      />
    );

    const clearBtn = screen.getByRole("button", { name: /clear/i });
    expect(clearBtn).toBeInTheDocument();
    await userEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalled();
  });

  test("shows result hint with correct pluralization", () => {
    const { rerender } = render(
      <SearchBar
        searchTerm="test"
        onSearchChange={jest.fn()}
        onClear={jest.fn()}
        resultCount={1}
        totalCount={10}
      />
    );

    expect(screen.getByText(/1\s+film\s+found/i)).toBeInTheDocument();

    rerender(
      <SearchBar
        searchTerm="test"
        onSearchChange={jest.fn()}
        onClear={jest.fn()}
        resultCount={3}
        totalCount={10}
      />
    );

    expect(screen.getByText(/3\s+films\s+found/i)).toBeInTheDocument();
  });
});
