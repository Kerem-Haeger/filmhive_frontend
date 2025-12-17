import { useState } from "react";
import { filmService } from "../services/filmService";

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
      let errorMessage = "Failed to find compromise films";
      if (err.response?.status === 401) {
        errorMessage = "You must be logged in to use Blend Mode.";
      } else if (err.response?.status === 400) {
        const fieldErrors = err.response?.data;
        if (fieldErrors?.detail) {
          errorMessage = fieldErrors.detail;
        } else if (typeof fieldErrors === "object") {
          errorMessage = Object.entries(fieldErrors)
            .map(([field, messages]) => {
              const msg = Array.isArray(messages) ? messages[0] : messages;
              return msg;
            })
            .join(" ");
        }
      } else if (err.response?.status === 404) {
        errorMessage = "One or both films not found.";
      }
      setError(errorMessage);
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
