import axios from "axios";

const API_BASE= "http://localhost:3000/api/songs"

export const getAllSong = async ()=> {
    const response = await axios.get(API_BASE);
    return response.data.data;
};

export const getSongByReleaseDate= async()=>{
    const response = await axios.get(`${API_BASE}/all/latest`);
    return response.data.data;
}

export const getAllSongWithFeature = async () => {
  const response = await axios.get(`${API_BASE}/with-feature/all`);
  return response.data.data;
};

export const getHotTrendSongs = async (limit = 10) => {
  const response = await axios.get(`${API_BASE}/hotTrend?limit=${limit}`);
  return response.data.data;
};
export const searchSongs = async (query) => {
    try {
        if (!query || query.trim() === '') {
            return { success: false, data: [], total: 0 };
        }

        const response = await axios.get(`${API_BASE}/search`, { 
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
      return { success: false, data: { songs: [], singers: [], genres: [] } };
    }

    const response = await axios.get(`${API_BASE}/search/all`, { 
      params: { q: query.trim() }
    });
    
    return response.data;
  } catch (error) {
    console.error('Search all error:', error);
    throw error;
  }
};

export const getSongsBySinger = async (singerId) => {
  const response = await axios.get(`${API_BASE}/singer/${singerId}`);
  return response.data.data;
};

export const getSongsByGenre = async (genreId) => {
  const response = await axios.get(`${API_BASE}/genre/${genreId}`);
  return response.data.data;
};