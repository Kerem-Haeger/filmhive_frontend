import { useState } from "react";
import { filmService } from "../services/filmService";
import { formatError } from "../utils/errorUtils";

export const useBlendMode = () => {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCompromise = async (filmAId, filmBId, alpha = 0.5, limit = 20) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await filmService.getCompromiseFilms(
        filmAId,
        filmBId,
        alpha,
        limit
      );
      setResults(data);
    } catch (err) {
      setError(formatError(err, "Failed to find compromise films."));
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
  };

  return {
    results,
    isLoading,
    error,
    fetchCompromise,
    clearResults,
  };
};
