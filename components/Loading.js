import PropTypes from "prop-types";

const CircularSpinner = ({ size = "medium", color = "text-sidenav" }) => {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-10 h-10",
    large: "w-16 h-16",
  };

  return (
    <div className="flex justify-center items-center h-screen w-full">
      <div
        className={`${sizeClasses[size]} border-4 border-t-4 border-gray-200 rounded-full animate-spin ${color}`}
        style={{ borderTopColor: "currentColor" }}
      ></div>
    </div>
  );
};

CircularSpinner.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large"]),
  color: PropTypes.string,
};

export default CircularSpinner;
