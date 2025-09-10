import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from './components/Login';
import Signup from './components/Signup';
import Navbar from './components/Navbar';
import React from 'react';


const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="rounded-2xl border border-green-100 p-8 bg-white">
            <h1 className="text-3xl font-semibold text-green-800">Welcome to HackCube</h1>
            <p className="text-green-700 mt-2">Use the navigation to login or sign up.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    path: "/signup",
    element: (
      <div>
        <Navbar />
        <Signup />
      </div>
    ),
  },
  {
    path: "/login",
    element: (
      <div>
        <Navbar />
        <Login />
      </div>
    ),
  },
]);


function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
