import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import MovieModal from "../MovieModal/MovieModal";
import type { Movie } from "../../types/movie";
import { fetchMovies } from "../../services/movieService";
import ReactPaginate from "react-paginate";
import styles from "./App.module.css";

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [selected, setSelected] = useState<Movie | null>(null);
  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  const handleSearch = async (q: string) => {
    setMovies([]);
    setHasError(false);
    setSelected(null);
    setQuery(q);
    setPage(1);
    setTotalPages(0);
    if (!q.trim()) return;
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePageChange = async ({ selected }: { selected: number }) => {
    if (!query) return;
    const nextPage = selected + 1;
    if (nextPage === page) return;
    try {
      setIsLoading(true);
      setHasError(false);
      const data = await fetchMovies(query, nextPage);
      setMovies(data.results);
      setPage(nextPage);
      setTotalPages(data.total_pages);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className={styles.app}>
      <SearchBar onSubmit={handleSearch} />

      {isLoading && movies.length === 0 && <Loader />}
      {!isLoading && hasError && <ErrorMessage />}

      {!hasError && movies.length > 0 && (
        <>
          <MovieGrid movies={movies} onSelect={setSelected} />

          {totalPages > 1 && (
            <ReactPaginate
              pageCount={Math.min(totalPages, 500)}
              pageRangeDisplayed={5}
              marginPagesDisplayed={1}
              onPageChange={handlePageChange}
              forcePage={page - 1}
              className={styles.pagination}
              activeClassName={styles.active}
              nextLabel="→"
              previousLabel="←"
            />
          )}

          {isLoading && movies.length > 0 && <Loader />}
        </>
      )}

      {selected && (
        <MovieModal movie={selected} onClose={() => setSelected(null)} />
      )}

      <Toaster position="top-right" />
    </div>
  );
}
