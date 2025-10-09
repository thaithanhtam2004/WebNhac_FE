export default function MusicPlayerBar() {
  return (
    <footer className="h-20 bg-blue-900 flex items-center justify-between px-6 border-t border-blue-700">
      <div className="flex items-center gap-4">
        <div className="bg-blue-700 h-12 w-12 rounded-lg"></div>
        <div>
          <p className="font-medium">Tên bài hát</p>
          <p className="text-sm text-blue-200">Tên ca sĩ</p>
        </div>
        <div className="flex gap-3 ml-4 text-lg">
          <span>❤️</span>
          <span>➕</span>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <span>🎵 Thanh điều khiển phát nhạc 🎵</span>
        <span className="text-sm text-blue-200">Thời lượng bài hát</span>
      </div>
      <div className="flex gap-4">
        <span>🔊</span>
        <span>🎚️</span>
      </div>
    </footer>
  );
}
