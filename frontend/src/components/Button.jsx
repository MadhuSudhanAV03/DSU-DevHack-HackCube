import React from "react";

const Button = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
