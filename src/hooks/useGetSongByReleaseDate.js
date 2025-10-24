import { useState, useEffect } from "react";
import axios from "axios";
import { data } from "react-router-dom";

export function useGetSongByReleaseDate(){
    const[data, setData] = useState([]);
    const[loading, setLoading]= useState(true);
    const[error,setError]= useState(null);

    useEffect(()=>{
        async function fetchSongs() {
            try{
                const res = await axios.get("http://localhost:3000/api/songs/all/latest");
                setData(res.data.data|| [])
            }catch (error){
                 setError(error.message);   
            }finally{
                setLoading(false);
            }
        }
        fetchSongs();
    },[])

    return{data, loading,error};
}