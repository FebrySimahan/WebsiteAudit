import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authUtils } from "../../services/api";

const LoginPage = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const password = passwordRef.current?.value || "";
      await authUtils.login(name, password);


      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login gagal");
      if (passwordRef.current) {
        passwordRef.current.value = "";
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Login</h1>
        <p className="text-center text-gray-500 text-sm mb-6">Website Audit System</p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              placeholder="Username"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
            <input
              ref={passwordRef}
              type="password"
              placeholder="Password"
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition disabled:bg-gray-400"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
