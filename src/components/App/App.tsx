import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import MovieModal from "../MovieModal/MovieModal";
import type { Movie } from "../../types/movie";
import { fetchMovies } from "../../services/movieService";
import type { TMDBSearchResponse } from "../../services/movieService";
import { useQuery } from "@tanstack/react-query";
import ReactPaginate from "react-paginate";
import styles from "./App.module.css";

export default function App() {
  const [selected, setSelected] = useState<Movie | null>(null);
  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const { data, isLoading, isError, isFetching, isSuccess } =
    useQuery<TMDBSearchResponse>({
      queryKey: ["movies", query, page] as const,
      queryFn: () => fetchMovies(query, page),
      enabled: query.trim().length > 0,
      // сохраняем предыдущие данные при листании
      placeholderData: (prev) => prev,
    });

  const movies = data?.results ?? [];
  const totalPages = Math.min(data?.total_pages ?? 0, 500);

  const handleSearch = (q: string) => {
    setSelected(null);
    setQuery(q);
    setPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = ({ selected }: { selected: number }) => {
    const next = selected + 1;
    if (next !== page) setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (isSuccess && query && movies.length === 0) {
      toast("No movies found for your request.");
    }
  }, [isSuccess, movies.length, query]);

  return (
    <div className={styles.app}>
      <SearchBar onSubmit={handleSearch} />

      {isLoading && movies.length === 0 ? (
        <Loader />
      ) : isError ? (
        <ErrorMessage />
      ) : movies.length > 0 ? (
        <>
          <MovieGrid movies={movies} onSelect={setSelected} />

          {totalPages > 1 && (
            <ReactPaginate
              pageCount={totalPages}
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

          {isFetching && movies.length > 0 && <Loader />}
        </>
      ) : null}

      {selected && (
        <MovieModal movie={selected} onClose={() => setSelected(null)} />
      )}

      <Toaster position="top-right" />
    </div>
  );
}
