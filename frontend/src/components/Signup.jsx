import React, { useState } from "react";
import Input from "./Input";
import { useForm } from "react-hook-form";
import Button from "./Button";
import { api, setAccessToken } from "../utils/auth";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [error, setError] = useState("");

  const signup = async (data) => {
    setError("");
    try {
      // api has baseURL=/api and withCredentials: true
      const res = await api.post("/auth/signup", data);

      if (res.status === 201 || res.status === 200) {
        // Save access token and redirect
        if (res.data?.accessToken) {
          setAccessToken(res.data.accessToken);
        }
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-57px)] flex items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
      <div className="w-full max-w-md bg-white border border-green-100 rounded-2xl shadow-sm p-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-green-800">
            Create account
          </h2>
          <p className="text-sm text-green-700 mt-1">Join us to get started</p>
        </div>

        <form onSubmit={handleSubmit(signup)} className="space-y-4">
          <Input
            type="text"
            label="Full Name"
            placeholder="Enter your name"
            {...register("name")}
          />

          <Input
            type="text"
            label="Username"
            placeholder="Choose a username"
            {...register("username", { required: "Username is required" })}
          />
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username.message}</p>
          )}

          <Input
            type="email"
            label="Email"
            placeholder="Enter your email"
            {...register("email", {
              required: "Email is required",
              validate: (v) =>
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
                "Invalid email address",
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            {...register("password", {
              required: "Password is required",
              validate: (value) =>
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(
                  value
                ) ||
                "Password must be at least 8 chars and include upper, lower, number, and special character",
            })}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button type="submit" className="w-full">
            Sign up
          </Button>
        </form>

        <p className="text-sm text-green-700 mt-4 text-center">
          Already have an account?{" "}
          <Link className="text-green-700 underline" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
