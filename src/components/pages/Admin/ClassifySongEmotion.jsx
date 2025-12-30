import { useState, useEffect } from "react";
import axios from "../../../configs/apiConfig";
import React from "react";

export default function ClassifySongEmotion() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [openSongId, setOpenSongId] = useState(null);
  const [songStates, setSongStates] = useState({}); // { file, predicting, result }

  // 🟢 Lấy danh sách bài hát kèm trạng thái đã phân tích
  const fetchSongs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/songs/with-feature/all");

      // ép thêm field hasFeature cho chắc chắn
      setSongs(
        (res.data?.data || []).map((song) => ({
          ...song,
          hasFeature: !!song.hasFeature,
        }))
      );

      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Không thể tải danh sách bài hát");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  // 🧠 Hàm gọi API dự đoán cảm xúc
  const handlePredictEmotion = async (songId) => {
    const songState = songStates[songId];
    if (!songState?.file) return alert("Vui lòng chọn file nhạc để dự đoán!");

    const formData = new FormData();
    formData.append("file", songState.file);
    formData.append("songId", songId);

    // Bật trạng thái loading riêng từng bài
    setSongStates((prev) => ({
      ...prev,
      [songId]: { ...prev[songId], predicting: true },
    }));

    try {
      const res = await axios.post("/features/predict-emotion", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = res.data?.data;
      setSongStates((prev) => ({
        ...prev,
        [songId]: {
          ...prev[songId],
          predicting: false,
          result,
        },
      }));

      alert(`🎭 Cảm xúc dự đoán: ${result?.emotion || "Không xác định"}`);
    } catch (err) {
      console.error("❌ Lỗi dự đoán:", err);
      alert("Không thể dự đoán cảm xúc!");
      setSongStates((prev) => ({
        ...prev,
        [songId]: { ...prev[songId], predicting: false },
      }));
    }
  };

  // 🟢 Lọc danh sách bài hát theo tên
  const filteredSongs = songs.filter((s) =>
    (s?.title || "").toLowerCase().includes(search.toLowerCase())
  );

  // 🧩 Hàm định dạng ngày
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const [year, month, day] = String(dateString).substring(0, 10).split("-");
      return `${day}/${month}/${year}`;
    } catch {
      return "—";
    }
  };

  return (
    <div className="p-8 relative">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Phân loại cảm xúc bài hát 🎶
      </h1>

      {/* Ô tìm kiếm */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm bài hát..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white shadow rounded-xl overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-center w-12">#</th>
              <th className="px-6 py-3 text-left">Tên bài hát</th>
              <th className="px-6 py-3 text-left">Ca sĩ</th>
              <th className="px-6 py-3 text-left">Thể loại</th>
              <th className="px-6 py-3 text-center">Ngày phát hành</th>
              <th className="px-6 py-3 text-center">Đã phân tích</th>
              <th className="px-6 py-3 text-center">Cảm xúc dự đoán</th>
              <th className="px-6 py-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-gray-600">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-red-500">
                  {error}
                </td>
              </tr>
            ) : filteredSongs.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-gray-600">
                  Không có bài hát nào.
                </td>
              </tr>
            ) : (
              filteredSongs.map((song, index) => (
                <React.Fragment key={song.songId}>
                  <tr className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-center">{index + 1}</td>
                    <td className="px-6 py-3">{song.title || "—"}</td>
                    <td className="px-6 py-3">{song.singerName || "—"}</td>
                    <td className="px-6 py-3">{song.genreName || "—"}</td>
                    <td className="px-6 py-3 text-center">
                      {formatDate(song.releaseDate)}
                    </td>
                    {/* ✅ Cột trạng thái đã phân tích */}
                    <td className="px-6 py-3 text-center">
                      {song.hasFeature ? "✅" : "—"}
                    </td>
                    {/* 🎭 Cột kết quả dự đoán */}
                    <td className="px-6 py-3 text-center">
                      {songStates[song.songId]?.result ? (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-xl font-semibold">
                          {songStates[song.songId].result.emotionName}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    {/* 🧠 Cột hành động */}
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() =>
                          setOpenSongId(
                            openSongId === song.songId ? null : song.songId
                          )
                        }
                        className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600"
                      >
                        Dự đoán
                      </button>
                      {songStates[song.songId]?.predicting && (
                        <div className="inline-block ml-2 w-4 h-4 border-2 border-t-indigo-500 border-gray-300 rounded-full animate-spin"></div>
                      )}
                    </td>
                  </tr>

                  {/* Frame chọn file để dự đoán */}
                  {openSongId === song.songId && (
                    <tr className="bg-gray-50">
                      <td colSpan="8" className="px-6 py-4">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                          <input
                            type="file"
                            accept=".mp3,.wav,.flac"
                            onChange={(e) =>
                              setSongStates((prev) => ({
                                ...prev,
                                [song.songId]: {
                                  ...prev[song.songId],
                                  file: e.target.files[0],
                                },
                              }))
                            }
                            className="px-3 py-2 border rounded-lg w-full md:w-1/3"
                          />
                          <button
                            onClick={() => handlePredictEmotion(song.songId)}
                            disabled={songStates[song.songId]?.predicting}
                            className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 flex items-center gap-2"
                          >
                            Phân loại cảm xúc
                            {songStates[song.songId]?.predicting && (
                              <div className="w-4 h-4 border-2 border-t-white border-gray-200 rounded-full animate-spin"></div>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}