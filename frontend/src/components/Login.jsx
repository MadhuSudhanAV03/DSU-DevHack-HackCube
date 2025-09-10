import React, { useState } from "react";
import Input from "./Input";
import { useForm } from "react-hook-form";
import Button from "./Button";
import { api, setAccessToken } from "../utils/auth";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [error, setError] = useState("");

  const login = async (data) => {
    setError("");
    try {
      // send identifier (username or email) and password
      const res = await api.post("/auth/login", data);

      if (res.status === 200) {
        if (res.data?.accessToken) {
          setAccessToken(res.data.accessToken);
        }
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-57px)] flex items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
      <div className="w-full max-w-md bg-white border border-green-100 rounded-2xl shadow-sm p-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-green-800">
            Welcome back
          </h1>
          <p className="text-sm text-green-700 mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit(login)} className="space-y-4">
          <Input
            type="text"
            label="Username or Email"
            placeholder="Enter your username or email"
            {...register("identifier", {
              required: "Username or Email is required",
            })}
          />
          {errors.identifier && (
            <p className="text-red-500 text-sm">{errors.identifier.message}</p>
          )}

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>

        <p className="text-sm text-green-700 mt-4 text-center">
          Don't have an account?{" "}
          <Link className="text-green-700 underline" to="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
