import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { api } from "../utils/auth";
import Logo from "./Logo"; // adjust import to your Logo component path
import LogoutBtn from "./LogoutBtn";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null); // null = unknown, false = not logged in
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pathname = location.pathname;
    if (pathname === "/login" || pathname === "/signup") {
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/users/me"); // uses Authorization header
        if (!mounted) return;
        setUser(res.data.user || null);
      } catch (err) {
        // not logged in or token expired and refresh failed
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  // determine authStatus (truthy when user object present and maybe active)
  const authStatus =
    !!user && (user.isActive === undefined ? true : !!user.isActive);

  const navItems = [
    { name: "Home", slug: "/", active: true },
    { name: "Login", slug: "/login", active: !authStatus },
    { name: "Signup", slug: "/signup", active: !authStatus },
    { name: "All Posts", slug: "/all-posts", active: authStatus },
    { name: "Add Posts", slug: "/add-post", active: authStatus },
  ];

  return (
    <header className="py-3 shadow bg-white">
      <div className="container mx-auto px-4 flex items-center">
        <div className="mr-4">
          <Link to="/">
            {/* adjust Logo props as needed */}
            <Logo width="70px" />
          </Link>
        </div>

        <ul className="flex ml-auto items-center gap-2">
          {loading ? (
            <li className="px-4 py-2 text-sm text-gray-500">Loading...</li>
          ) : (
            navItems.map(
              (item) =>
                item.active && (
                  <li key={item.name}>
                    <button
                      onClick={() => navigate(item.slug)}
                      className="inline-block px-6 py-2 duration-200 hover:bg-blue-100 rounded-full"
                    >
                      {item.name}
                    </button>
                  </li>
                )
            )
          )}

          {authStatus && (
            <li>
              <LogoutBtn
                onLoggedOut={() => {
                  setUser(null);
                  navigate("/login");
                }}
              />
            </li>
          )}
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
