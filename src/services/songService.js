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
