import css from "./MovieGrid.module.css";
import type { Movie } from "../../types/movie";
import { posterUrl } from "../../services/movieService";

export interface MovieGridProps {
  movies: Movie[];
  onSelect: (movie: Movie) => void;
}

export default function MovieGrid({ movies, onSelect }: MovieGridProps) {
  if (!movies.length) return null;

  return (
    <ul className={css.grid}>
      {movies.map((movie) => (
        <li key={movie.id}>
          <div
            className={css.card}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(movie)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSelect(movie);
            }}
          >
            <img
              className={css.image}
              src={posterUrl(movie.poster_path) || undefined}
              alt={movie.title}
              loading="lazy"
            />
            <h2 className={css.title}>{movie.title}</h2>
          </div>
        </li>
      ))}
    </ul>
  );
}
