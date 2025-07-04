import axios from "axios";
import { Comic } from "../types";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

export const getComics = async (): Promise<Comic[]> => {
  const response = await api.get("/comics");
  return response.data;
};
