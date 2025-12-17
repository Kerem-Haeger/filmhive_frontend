import { useContext } from "react";
import { WatchlistsContext } from "../context/WatchlistsContext";

export function useWatchlists() {
  return useContext(WatchlistsContext);
}
