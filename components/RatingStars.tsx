"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Star } from "lucide-react";
 import { useCountdown } from "../contexts/CountdownContext"

type RatingStarsProps = {
  artId: string;
  userId: string;
 
};

export default function RatingStars({ artId, userId }: RatingStarsProps) {
  const [rating, setRating] = useState<number>(0); // current user’s rating
  const [hover, setHover] = useState<number>(0);   // hovered star
  const [totalPoints, setTotalPoints] = useState<number>(0); // sum of all ratings
 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRating = async () => {
      // Get current user’s rating
      const { data: existing } = await supabase
        .from("votes")
        .select("rating")
        .eq("user_id", userId)
        .eq("art_id", artId)
        .single();

      if (existing) setRating(existing.rating);

      // Get total points
      const { data: allRatings } = await supabase
        .from("votes")
        .select("rating")
        .eq("art_id", artId);

      const sum = allRatings?.reduce((acc, r) => acc + r.rating, 0) || 0;
      setTotalPoints(sum);
    };

    fetchRating();
  }, [artId, userId]);

  const handleRating = async (value: number) => {
    if (loading) return;
    setLoading(true);

    // Upsert = insert or update
    const { error } = await supabase
      .from("votes")
      .upsert(
        { art_id: artId, user_id: userId, rating: value },
        { onConflict: "art_id, user_id" }
      );

    if (error) {
      console.error("Rating failed:", error);
      alert(`خطأ في حفظ التقييم`);
      setLoading(false);
      return;
    }

    setRating(value);

    // Refresh total
    const { data: allRatings } = await supabase
      .from("votes")
      .select("rating")
      .eq("art_id", artId);

    const sum = allRatings?.reduce((acc, r) => acc + r.rating, 0) || 0;
    setTotalPoints(sum);

    setLoading(false);
  };

  const handleRemoveRating = async () => {
    if (!userId) return;

    const { error } = await supabase
      .from("votes")
      .delete()
      .eq("art_id", artId)
      .eq("user_id", userId);

    if (error) {
      console.error("Remove rating failed:", error);
      alert("حدث خطأ أثناء إزالة التقييم");
      return;
    }

    setRating(0); // reset UI

    // Refresh total after delete
    const { data: allRatings } = await supabase
      .from("votes")
      .select("rating")
      .eq("art_id", artId);

    const sum = allRatings?.reduce((acc, r) => acc + r.rating, 0) || 0;
    setTotalPoints(sum);
  };
const { hasEnded } = useCountdown()
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Stars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => !hasEnded && handleRating(value)}
            onMouseEnter={() => setHover(value)}
            onMouseLeave={() => setHover(0)}
            disabled={loading}
          >
            <Star
              className={`w-6 h-6 transition ${
                (hover || rating) >= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Remove Rating */}
      {rating > 0 && (
        <button
          onClick= {()=> !hasEnded && handleRemoveRating()}
          className="text-sm text-red-600 hover:underline mt-2"
        >
          إزالة تقييمي
        </button>
      )}

      {/* Total sum of stars */}
      <span className="text-sm text-amber-700 font-medium">
        مجموع النقاط: {totalPoints}
      </span>
    </div>
  );
}
