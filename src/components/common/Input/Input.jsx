const Input = ({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  error = "",
  disabled = false,
  required = false,
  className = "",
  name = "",
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-lg text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"}
          ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-400" : ""}
          ${className}
        `}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default Input;
