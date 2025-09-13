import { useEffect, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import css from "./MovieModal.module.css";
import type { Movie } from "../../types/movie";
import { backdropUrl } from "../../services/movieService";

export interface MovieModalProps {
  movie: Movie;
  onClose: () => void;
}

const modalRoot =
  typeof document !== "undefined" ? document.getElementById("modal-root") : null;

export default function MovieModal({ movie, onClose }: MovieModalProps) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEsc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const onBackdrop = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const view = (
    <div className={css.backdrop} role="dialog" aria-modal="true" onClick={onBackdrop}>
      <div className={css.modal}>
        <button
          className={css.closeButton}
          aria-label="Close modal"
          onClick={onClose}
          type="button"
        >
          &times;
        </button>
        {movie.backdrop_path && (
          <img
            src={backdropUrl(movie.backdrop_path)}
            alt={movie.title}
            className={css.image}
          />
        )}
        <div className={css.content}>
          <h2>{movie.title}</h2>
          <p>{movie.overview}</p>
          <p>
            <strong>Release Date:</strong> {movie.release_date || "—"}
          </p>
          <p>
            <strong>Rating:</strong>{" "}
            {movie.vote_average ? `${movie.vote_average}/10` : "—"}
          </p>
        </div>
      </div>
    </div>
  );

  return modalRoot ? createPortal(view, modalRoot) : view;
}
