"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { Upload, ImageIcon, Type, CheckCircle, AlertCircle } from "lucide-react"
import { Session } from "@supabase/supabase-js"
import { CountdownProvider, useCountdown } from "../contexts/Countdowncontext"


export default function AddArtworkForm() {
  const [title, setTitle] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState("")
  const [session, setSession] = useState<Session | null>(null)
const [file, setFile] = useState<File | null>(null)

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    setFile(e.target.files[0])
  }
}

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  setLoading(true);

  let uploadedImageUrl = imageUrl;

  // If the user selected a file, upload it
  if (file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `artworks/${fileName}`;

 const { error: uploadError } = await supabase.storage
  .from("artworks")
  .upload(filePath, file);

if (uploadError) {
  setMessage(`Upload Error: ${uploadError.message}`);
  setIsSuccess(false);
  setLoading(false);
  return;
}

const { data: publicUrlData } = supabase
  .storage
  .from("artworks")
  .getPublicUrl(filePath);

uploadedImageUrl = publicUrlData.publicUrl;

// ✅ Update state so preview works and form behaves correctly
setImageUrl(uploadedImageUrl);

  }

  // Insert artwork with image URL
  const { error } = await supabase
    .from("artworks")
    .insert([{ title, image_url: uploadedImageUrl, user_id: session?.user?.id, content: content.trim(), }]);

  setLoading(false);

  if (error) {
    setMessage(`Database Error: ${error.message}`);
    setIsSuccess(false);
  } else {
    setMessage("تم اضافة عملك الفني بنجاح!");
    setIsSuccess(true);
    setTitle("");
    setImageUrl("");
    setFile(null);

    setTimeout(() => {
      setMessage("");
      setIsSuccess(false);
    }, 3000);
  }
};
 
  return (
     
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-sm border border-amber-200 rounded-3xl p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
              اضافة عمل فني
            </h2>
           </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div >
              <label className="block text-sm font-medium text-amber-800 mb-2 ">
                <Type className="w-4 h-4 inline mr-2" />
                العنوان
              </label>
              <input
                type="text"
                placeholder="عنوان العمل الفني"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-4 border border-amber-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-200 focus:outline-none text-amber-900 placeholder-amber-500 transition-all"
                required
              />
            </div>
            <div >
              <label className="block text-sm font-medium text-amber-800 mb-2 ">
                <Type className="w-4 h-4 inline mr-2" />
                الوصف
              </label>
              <textarea
                 
                placeholder="وصف العمل الفني"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 border border-amber-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-200 focus:outline-none text-amber-900 placeholder-amber-500 transition-all"
                  
              />
            </div>

            {/* Image URL Input */}
      {!file && (
  <div>
    <label className="block text-sm font-medium text-amber-800 mb-2">
      <ImageIcon className="w-4 h-4 inline mr-2" />
      عنوان URL
    </label>
    <input
      type="url"
      placeholder="https://example.com/your-artwork.jpg"
      value={imageUrl}
      required
      onChange={(e) => setImageUrl(e.target.value)}
      className="w-full p-4 border border-amber-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-200 focus:outline-none text-amber-900 placeholder-amber-500 transition-all"
    />
  </div>
)}

<input
  type="file"
  accept="image/*"
  onChange={handleFileChange}
  className="w-full p-2 border rounded-md bg-grey-500"
/>

            {/* Preview */}
            {imageUrl && (
              <div className="bg-amber-50/50 backdrop-blur-sm rounded-2xl p-4 border border-amber-200">
                <p className="text-sm font-medium text-amber-800 mb-2"></p>
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-xl border border-amber-200"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              </div>
            )}

            {/* Submit Button */}
             
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-4 rounded-xl hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium text-lg shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                يتم اضافة العمل الفني..
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  اضافة عمل فني
                </>
              )}
            </button>
 
 
            {/* Message */}
            {message && (
              <div
                className={`p-4 rounded-xl border flex items-center gap-2 ${
                  isSuccess ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                {isSuccess ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <p className="font-medium">{message}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
     
  )
}
