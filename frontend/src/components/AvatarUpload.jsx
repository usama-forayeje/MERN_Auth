import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Camera, Upload, X } from "lucide-react"
import toast from "react-hot-toast"
import NameInitialsAvatar from "./NameInitialsAvatar"

const AvatarUpload = ({ currentAvatar, onAvatarChange, userName }) => {
  const [previewUrl, setPreviewUrl] = useState(currentAvatar?.url || null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF)")
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error("Image size should be less than 5MB")
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result)
    }
    reader.readAsDataURL(file)

    // Pass the file to parent component for upload
    onAvatarChange(file)
  }

  const handleRemoveAvatar = () => {
    setPreviewUrl(null)
    onAvatarChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-500 shadow-lg relative bg-gray-800"
        >
          {previewUrl ? (
            <img src={previewUrl || "/placeholder.svg"} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {userName ? (
                <NameInitialsAvatar name={userName} size="w-24 h-24" textSize="text-xl" />
              ) : (
                <Camera className="w-10 h-10 text-gray-400" />
              )}
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <motion.div
                className="w-8 h-8 border-2 border-t-2 border-t-orange-500 border-orange-200 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
            </div>
          )}
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full shadow-lg"
          disabled={isUploading}
        >
          <Upload className="w-4 h-4" />
        </motion.button>

        {previewUrl && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRemoveAvatar}
            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full shadow-lg"
            disabled={isUploading}
          >
            <X className="w-3 h-3" />
          </motion.button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif"
        className="hidden"
      />

      <p className="text-xs text-gray-400 mt-2">Click to upload a new avatar</p>
    </div>
  )
}

export default AvatarUpload
