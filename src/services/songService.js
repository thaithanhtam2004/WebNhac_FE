import axios from "axios";

// ==================== BASE URLs ====================
const API_BASE = "http://localhost:3000/api";
const SONGS_API = `${API_BASE}/songs`;
const SINGERS_API = `${API_BASE}/singers`;
const GENRES_API = `${API_BASE}/genres`;
const ALBUMS_API = `${API_BASE}/albums`;

// ==================== SONGS ====================
export const getAllSong = async () => {
  const response = await axios.get(SONGS_API);
  return response.data.data;
};

export const getSongById = async (songId) => {
  try {
    const response = await axios.get(`${SONGS_API}/${songId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching song:", error);
    throw error;
  }
};

export const getSongByReleaseDate = async () => {
  const response = await axios.get(`${SONGS_API}/all/latest`);
  return response.data.data;
};

export const getAllSongWithFeature = async () => {
  const response = await axios.get(`${SONGS_API}/with-feature/all`);
  return response.data.data;
};

export const getHotTrendSongs = async (limit = 10) => {
  const response = await axios.get(`${SONGS_API}/hotTrend?limit=${limit}`);
  return response.data.data;
};

// ==================== SEARCH ====================
export const searchSongs = async (query) => {
  try {
    if (!query || query.trim() === '') {
      return { success: false, data: [], total: 0 };
    }

    const response = await axios.get(`${SONGS_API}/search`, { 
      params: { q: query.trim() }
    });
    
    return response.data;
  } catch (error) {
    console.error('Search songs error:', error);
    throw error;
  }
};

export const searchAll = async (query) => {
  try {
    if (!query || query.trim() === '') {
      return { 
        success: false, 
        data: { songs: [], singers: [], genres: [], albums: [] } 
      };
    }

    const response = await axios.get(`${SONGS_API}/search/all`, { 
      params: { q: query.trim() }
    });
    
    return response.data;
  } catch (error) {
    console.error('Search all error:', error);
    throw error;
  }
};

// ==================== GET BY CATEGORY ====================
export const getSongsBySinger = async (singerId) => {
  try {
    const response = await axios.get(`${SONGS_API}/singer/${singerId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching songs by singer:', error);
    throw error;
  }
};

export const getSongsByGenre = async (genreId) => {
  try {
    const response = await axios.get(`${SONGS_API}/genre/${genreId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching songs by genre:', error);
    throw error;
  }
};

export const getSongsByAlbum = async (albumId) => {
  try {
    const response = await axios.get(`${SONGS_API}/album/${albumId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching songs by album:', error);
    throw error;
  }
};

// ==================== GET CATEGORY DETAILS ====================
export const getSingerById = async (singerId) => {
  try {
    const response = await axios.get(`${SINGERS_API}/${singerId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching singer:', error);
    throw error;
  }
};

export const getGenreById = async (genreId) => {
  try {
    const response = await axios.get(`${GENRES_API}/${genreId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching genre:', error);
    throw error;
  }
};

export const getAlbumById = async (albumId) => {
  try {
    const response = await axios.get(`${ALBUMS_API}/${albumId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching album:', error);
    throw error;
  }
};