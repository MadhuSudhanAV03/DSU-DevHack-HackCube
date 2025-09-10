import React from "react";

const Logo = ({ width = "70px" }) => {
  return (
    <img
      src="/vite.svg" // or your own logo path (put it in /public or /assets)
      alt="HackCube Logo"
      style={{ width }}
    />
  );
};

export default Logo;
