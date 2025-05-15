import { Input } from "./ui/input"

function CustomInput({ icon: Icon, error, ...props }) {
  return (
    <div className="relative mb-2">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon className="size-5 text-orange-500" />
      </div>
      <Input
        {...props}
        className={`w-full pl-10 pr-3 py-2 bg-gray-800 bg-opacity-50 rounded-lg border ${
          error ? "border-red-500" : "border-orange-500"
        } focus:border-orange-400 focus:ring-2 focus:ring-orange-400 text-white placeholder-gray-400 transition duration-200`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

export default CustomInput
