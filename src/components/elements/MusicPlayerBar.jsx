import LikeButton from "../MusicPlayerBarButton/LikeButton.jsx";
import AddButton from "../MusicPlayerBarButton/AddButton.jsx";
import ControlButton from "../MusicPlayerBarButton/ControlButton.jsx";
import VolumeControl from "../MusicPlayerBarButton/VolumeControl.jsx";

export default function MusicPlayerBar() {
  return (
    <footer className="h-20 bg-blue-900 flex items-center justify-between px-6 border-t border-blue-700">
      {/* Phần trái */}
      <div className="flex items-center gap-4">
        <div className="bg-blue-700 h-12 w-12 rounded-lg"></div>
        <div>
          <p className="font-medium text-white">Tên bài hát</p>
          <p className="text-sm text-blue-200">Tên ca sĩ</p>
        </div>
        <div className="flex gap-3 ml-4 text-lg">
          <LikeButton />
          <AddButton />
        </div>
      </div>

      {/* Phần giữa */}
      <div className="flex flex-col items-center gap-1">
        <ControlButton />
        <div className="w-80 h-1 bg-blue-700 rounded-full mt-1 relative">
          <div className="h-1 bg-white rounded-full w-1/3"></div>
        </div>
        <div className="flex justify-between w-80 text-xs text-blue-200 mt-1">
          <span>0:45</span>
          <span>3:12</span>
        </div>
      </div>

      {/* Phần phải */}
      <VolumeControl />
    </footer>
  );
}
