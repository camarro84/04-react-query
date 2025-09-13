import { useEffect, useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import MovieModal from "../MovieModal/MovieModal";
import type { Movie } from "../../types/movie";
import { fetchMovies } from "../../services/movieService";
import styles from "./App.module.css";

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [selected, setSelected] = useState<Movie | null>(null);
  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  const gridTopRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const ioSupported = typeof window !== "undefined" && "IntersectionObserver" in window;

  const handleSearch = async (q: string) => {
    setMovies([]);
    setHasError(false);
    setSelected(null);
    setQuery(q);
    setPage(1);
    setTotalPages(0);
    try {
      setIsLoading(true);
      const data = await fetchMovies(q, 1);
      if (!data.results.length) toast("No movies found for your request.");
      setMovies(data.results);
      setTotalPages(data.total_pages);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
      gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleLoadMore = async () => {
    if (!query || isLoading || page >= totalPages) return;
    try {
      setIsLoading(true);
      const nextPage = page + 1;
      const data = await fetchMovies(query, nextPage);
      setMovies((prev) => [...prev, ...data.results]);
      setPage(nextPage);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!ioSupported) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) handleLoadMore();
      },
      { root: null, rootMargin: "300px 0px 300px 0px", threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ioSupported, query, page, totalPages, isLoading]);

  return (
    <div className={styles.app}>
      <SearchBar onSubmit={handleSearch} />

      <div ref={gridTopRef} className={styles.gridTop} />

      {isLoading && movies.length === 0 && <Loader />}
      {!isLoading && hasError && <ErrorMessage />}

      {!hasError && movies.length > 0 && (
        <>
          <MovieGrid movies={movies} onSelect={setSelected} />

          {!ioSupported && page < totalPages && (
            <button type="button" onClick={handleLoadMore}>
              Load more
            </button>
          )}

          <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />

          {isLoading && movies.length > 0 && <Loader />}
        </>
      )}

      {selected && <MovieModal movie={selected} onClose={() => setSelected(null)} />}

      <Toaster position="top-right" />
    </div>
  );
}
