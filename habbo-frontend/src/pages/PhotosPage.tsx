import { useState, useEffect } from "react";
import { Camera, Image } from "lucide-react";
import { apiGet } from "../api";

interface Photo {
  id: number;
  user_id: number;
  username: string;
  room_id: number;
  timestamp: number;
  url: string;
}

export function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/api/photos")
      .then((data) => { setPhotos(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-pink-700 via-rose-600 to-pink-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-black/20 rounded-xl flex items-center justify-center border border-white/10">
                <Camera className="w-8 h-8 text-pink-200" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Community Photos</h1>
                <p className="text-pink-200/70 text-sm mt-0.5">Share your best moments from the hotel</p>
              </div>
            </div>
            <span className="text-pink-200/50 text-xs">Take a photo in-game to share it here</span>
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      {loading ? (
        <div className="text-center text-zinc-500 py-12">Loading photos...</div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-all group">
              <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                <img src={photo.url} alt={`Photo by ${photo.username}`} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={`https://www.habbo.com/habbo-imaging/avatarimage?user=${photo.username}&direction=2&head_direction=2&size=s`} alt="" className="w-8 h-8" style={{ imageRendering: "pixelated" }} />
                    <span className="text-xs text-sky-400 font-medium">{photo.username}</span>
                  </div>
                  <span className="text-[10px] text-zinc-600">Room #{photo.room_id}</span>
                </div>
                <div className="text-[10px] text-zinc-600 mt-1">{new Date(photo.timestamp * 1000).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-4 border border-zinc-700">
            <Image className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-lg font-bold text-zinc-400">No Photos Yet</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-md mx-auto">
            Take a photo in-game using the camera and publish it — it will show up here automatically!
          </p>
        </div>
      )}
    </div>
  );
}
