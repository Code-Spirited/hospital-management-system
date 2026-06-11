const Card = ({
  children,
  title = "",
  subtitle = "",
  className = "",
  padding = true,
}) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 ${padding ? "p-6" : ""} ${className}`}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
