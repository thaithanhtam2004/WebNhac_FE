import { useState, useEffect } from "react";
import axios from "../../../configs/apiConfig";
import React from "react";
export default function ManageSongEmotion() {
  const [songs, setSongs] = useState([]);
  const [emotions, setEmotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [openSongId, setOpenSongId] = useState(null); // bài đang mở frame
  const [songStates, setSongStates] = useState({}); // trạng thái từng bài

  // 🟢 Lấy danh sách bài hát
  const fetchSongs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/songs/with-feature/all");
      // map để đảm bảo hasFeature luôn tồn tại
      setSongs(
        (res.data?.data || []).map((song) => ({
          ...song,
          hasFeature: song.hasFeature ? true : false,
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

  // 🟢 Lấy danh sách cảm xúc
  const fetchEmotions = async () => {
    try {
      const res = await axios.get("/emotions");
      setEmotions(res.data?.data || []);
    } catch (err) {
      console.error("Lỗi khi tải cảm xúc:", err);
    }
  };

  useEffect(() => {
    fetchSongs();
    fetchEmotions();
  }, []);

  // 🟢 Phân tích từng bài
  const handleAnalyzeAndAssign = async (songId) => {
    const songState = songStates[songId];
    if (!songState?.file) return alert("Vui lòng chọn file nhạc!");
    if (!songState?.emotionId) return alert("Vui lòng chọn cảm xúc!");

    const formData = new FormData();
    formData.append("songId", songId);
    formData.append("emotionId", songState.emotionId);
    formData.append("file", songState.file);

    // Bật spinner riêng bài này
    setSongStates((prev) => ({
      ...prev,
      [songId]: { ...prev[songId], saving: true },
    }));

    try {
      await axios.post("/features/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Phân tích & gán cảm xúc thành công!");

      // Cập nhật hasFeature để hiển thị cột "Đã phân tích"
      setSongs((prevSongs) =>
        prevSongs.map((s) =>
          s.songId === songId ? { ...s, hasFeature: true } : s
        )
      );

      // Reset trạng thái songStates
      setSongStates((prev) => ({
        ...prev,
        [songId]: { file: null, emotionId: null, saving: false },
      }));

      setOpenSongId(null); // đóng frame
    } catch (err) {
      console.error("❌ Lỗi phân tích:", err);
      alert("Không thể phân tích hoặc gán cảm xúc!");
      setSongStates((prev) => ({
        ...prev,
        [songId]: { ...prev[songId], saving: false },
      }));
    }
  };

  // 🟢 Lọc bài hát
  const filteredSongs = songs.filter((s) =>
    (s?.title || "").toLowerCase().includes(search.toLowerCase())
  );

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
        Phân tích cảm xúc bài hát
      </h1>

      {/* Ô tìm kiếm */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm bài hát..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white shadow rounded-xl overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-center w-12">STT</th>
              <th className="px-6 py-3 text-left">Tên bài hát</th>
              <th className="px-6 py-3 text-left">Ca sĩ</th>
              <th className="px-6 py-3 text-left">Thể loại</th>
              <th className="px-6 py-3 text-center">Ngày phát hành</th>
              <th className="px-6 py-3 text-center">Đã phân tích</th>
              <th className="px-6 py-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-600">
                  Đang tải...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-red-500">
                  {error}
                </td>
              </tr>
            ) : filteredSongs.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-600">
                  Không có dữ liệu
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
                    <td className="px-6 py-3 text-center">
                      {song.hasFeature ? "✅" : "—"}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() =>
                          setOpenSongId(
                            openSongId === song.songId ? null : song.songId
                          )
                        }
                        className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                      >
                        Phân tích
                      </button>
                      {songStates[song.songId]?.saving && (
                        <div className="inline-block ml-2 w-4 h-4 border-2 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
                      )}
                    </td>
                  </tr>

                  {/* Frame chọn file + cảm xúc */}
                  {openSongId === song.songId && (
                    <tr className="bg-gray-50">
                      <td colSpan="7" className="px-6 py-4">
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
                          <select
                            value={songStates[song.songId]?.emotionId || ""}
                            onChange={(e) =>
                              setSongStates((prev) => ({
                                ...prev,
                                [song.songId]: {
                                  ...prev[song.songId],
                                  emotionId: e.target.value,
                                },
                              }))
                            }
                            className="px-3 py-2 border rounded-lg w-full md:w-1/4"
                          >
                            <option value="">Chọn cảm xúc</option>
                            {emotions.map((e) => (
                              <option key={e.emotionId} value={e.emotionId}>
                                {e.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAnalyzeAndAssign(song.songId)}
                            disabled={songStates[song.songId]?.saving}
                            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-2"
                          >
                            Phân tích
                            {songStates[song.songId]?.saving && (
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
