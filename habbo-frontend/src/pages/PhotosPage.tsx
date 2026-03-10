import { useState } from "react";
import { Camera, Upload, Heart, MessageSquare, Image } from "lucide-react";

interface Photo {
  id: number;
  username: string;
  image_url: string;
  caption: string;
  likes: number;
  comments: number;
  created_at: string;
}

export function PhotosPage() {
  const [photos] = useState<Photo[]>([]);

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
            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg border border-white/20 transition-all">
              <Upload className="w-4 h-4" />
              Upload Photo
            </button>
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-all group">
              <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                <img src={photo.image_url} alt={photo.caption} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-sm text-zinc-300 line-clamp-2">{photo.caption}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-sky-400 font-medium">{photo.username}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <Heart className="w-3 h-3" /> {photo.likes}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <MessageSquare className="w-3 h-3" /> {photo.comments}
                    </span>
                  </div>
                </div>
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
            Be the first to share a photo! Capture your favorite moments in the hotel and share them with the community.
          </p>
        </div>
      )}
    </div>
  );
}
