const NameInitialsAvatar = ({ name, size = "w-10 h-10", textSize = "text-sm" }) => {
  const getInitials = (name) => {
    if (!name) return "U"

    const nameParts = name.split(" ")
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase()
    }

    return nameParts[0].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].charAt(0).toUpperCase()
  }

  // Generate a deterministic color based on the name
  const getColorClass = (name) => {
    if (!name) return "bg-orange-500"

    const colors = [
      "bg-amber-500",
      "bg-orange-500",
      "bg-rose-500",
      "bg-pink-500",
      "bg-purple-500",
      "bg-indigo-500",
      "bg-blue-500",
      "bg-cyan-500",
      "bg-teal-500",
      "bg-emerald-500",
    ]

    // Simple hash function to get a consistent color for the same name
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }

    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

  const initials = getInitials(name)
  const colorClass = getColorClass(name)

  return (
    <div
      className={`${size} ${colorClass} rounded-full flex items-center justify-center text-white font-medium ${textSize}`}
    >
      {initials}
    </div>
  )
}

export default NameInitialsAvatar
