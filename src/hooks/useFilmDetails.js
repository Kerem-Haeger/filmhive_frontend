import {
    useEffect,
    useState
} from "react";
import {
    filmService
} from "../services/filmService";

export function useFilmDetails(id) {
    const [film, setFilm] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchFilm = async () => {
            try {
                setIsLoading(true);
                setError("");
                const data = await filmService.getFilmById(id);
                setFilm(data);
            } catch (err) {
                console.error(err);
                setError("Could not load film details. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchFilm();
    }, [id]);

    return {
        film,
        isLoading,
        error
    };
}