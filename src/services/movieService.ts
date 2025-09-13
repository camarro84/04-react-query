import axios from "axios";
import type { AxiosInstance } from "axios";
import type { Movie } from "../types/movie";

const api: AxiosInstance = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}` }
});

export interface TMDBSearchResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export async function fetchMovies(query: string, page = 1): Promise<TMDBSearchResponse> {
  const { data } = await api.get<TMDBSearchResponse>("/search/movie", {
    params: { query, include_adult: false, language: "en-US", page }
  });
  return data;
}

export const posterUrl = (path: string | null) =>
  path ? `https://image.tmdb.org/t/p/w500${path}` : "";

export const backdropUrl = (path: string | null) =>
  path ? `https://image.tmdb.org/t/p/original${path}` : "";
