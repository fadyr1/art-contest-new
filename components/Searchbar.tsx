import { useState } from "react";

export default function ArtworkList({ artworks }: { artworks: any[] }) {
  const [search, setSearch] = useState("");

  const filteredArtworks = artworks.filter((artwork) =>
    artwork.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Search bar */}
      <input
        type="text"
        placeholder="ابحث عن عمل فني..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded-xl mb-4"
      />

      {/* List artworks */}
      {filteredArtworks.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredArtworks.map((artwork) => (
            <div
              key={artwork.id}
              className="p-4 bg-white rounded-2xl shadow"
            >
              <img src={artwork.image_url} alt={artwork.title} className="rounded-xl mb-2" />
              <h3 className="font-semibold">{artwork.title}</h3>
              <p className="text-sm text-gray-600">{artwork.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>لا توجد نتائج مطابقة</p>
      )}
    </div>
  );
}
