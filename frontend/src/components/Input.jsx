import React from "react";

const Input = ({ label, className = "", ...props }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="mb-1 text-sm text-gray-700">{label}</label>}
      <input
        className="w-full p-2 mb-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200"
        {...props}
      />
    </div>
  );
};

export default Input;
