import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import WorkspaceMembers from "../components/WorkspaceMembers.jsx";
import JoinRequests from "../components/JoinRequests.jsx";

function WorkspaceAdmin() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("members");
  const [copied, setCopied] = useState(false);
  const { authFetch } = useAuth();

  const handleCopyJoinCode = async () => {
    if (workspace?.joinCode) {
      try {
        await navigator.clipboard.writeText(workspace.joinCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  const fetchWorkspace = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await authFetch(`/api/workspaces/${workspaceId}`);
      setWorkspace(data);
    } catch (err) {
      setError(err.message || "Không thể tải thông tin workspace");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) {
      fetchWorkspace();
    }
  }, [workspaceId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="mx-4 max-w-md rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => navigate("/workspaces")}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700"
          >
            Quay lại danh sách workspace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/workspaces")}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {workspace?.name}
                </h1>
                <p className="text-sm text-gray-500">Quản lý Workspace</p>
              </div>
            </div>

            {/* Join Code Display */}
            {workspace?.joinCode && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Mã tham gia</p>
                  <p className="font-mono text-sm font-semibold text-gray-900">
                    {workspace.joinCode}
                  </p>
                </div>
                <button
                  onClick={handleCopyJoinCode}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  {copied ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Đã sao chép
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Sao chép
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("members")}
              className={`border-b-2 py-4 text-sm font-medium transition ${
                activeTab === "members"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Thành viên
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`border-b-2 py-4 text-sm font-medium transition ${
                activeTab === "requests"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              Yêu cầu tham gia
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-6">
        {activeTab === "members" && (
          <WorkspaceMembers workspaceId={workspaceId} />
        )}
        {activeTab === "requests" && (
          <JoinRequests workspaceId={workspaceId} />
        )}
      </main>
    </div>
  );
}

export default WorkspaceAdmin;
