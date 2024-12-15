import axios from "axios"

const httpClient = axios.create({
    baseURL: "https://api.giphy.com/v1/gifs/search",
    timeout: 3000,
    headers: {
        "Content-Type": "application/json; charset=utf-8"
    }
});

const keyword_trending = "trending";
const search = "search";
const API_KEY = "NRR7ajbCtZtFEazONT1UVSqKFTSnXhYE";
const limit = 100;
const offset = 0;
const rating = "pg-13";
const bundle = "messaging_non_clips";



export { httpClient, keyword_trending, search, API_KEY, limit, offset, rating, bundle }