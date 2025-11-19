import { useState } from "react";
import useAuth from "../hooks/useAuth.js";

function CreateWorkspaceModal({ onClose, onSuccess }) {
  const [formState, setFormState] = useState({
    name: "",
    description: "",
    isPrivate: false,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { authFetch } = useAuth();

  const handleChange = (field) => (event) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Vui lòng chọn file ảnh");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Use FormData if avatar is provided, otherwise JSON
      if (avatarFile) {
        const formData = new FormData();
        formData.append("name", formState.name);
        if (formState.description) {
          formData.append("description", formState.description);
        }
        formData.append("isPrivate", formState.isPrivate.toString());
        formData.append("avatar", avatarFile);

        const newWorkspace = await authFetch("/api/workspaces", {
          method: "POST",
          body: formData,
        });
        onSuccess(newWorkspace);
      } else {
        // Send as JSON if no avatar
        const newWorkspace = await authFetch("/api/workspaces", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formState.name,
            description: formState.description || undefined,
            isPrivate: formState.isPrivate,
          }),
        });
        onSuccess(newWorkspace);
      }
    } catch (err) {
      // More detailed error message
      let errorMsg = err.message || "Không thể tạo workspace";

      // Check for common backend errors
      if (errorMsg.includes("WORKSPACE_ADMIN") || errorMsg.includes("Role") || errorMsg.includes("not found")) {
        errorMsg = "⚠️ Lỗi Backend: Database chưa có roles. Backend dev cần chạy seed để tạo roles (WORKSPACE_ADMIN, WORKSPACE_MEMBER, etc.)";
      } else if (err.status === 401) {
        errorMsg = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
      } else if (err.status === 500) {
        errorMsg = "Lỗi server. Chi tiết: " + errorMsg;
      }

      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Tạo Workspace Mới
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Workspace Avatar (tùy chọn)
            </label>
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="flex-shrink-0">
                {avatarPreview ? (
                  <div className="relative h-20 w-20">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
                      aria-label="Remove avatar"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-slate-700 bg-slate-800">
                    <svg
                      className="h-8 w-8 text-slate-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <label
                  htmlFor="avatar-upload"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
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
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Upload Image
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <p className="mt-1 text-xs text-slate-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Tên Workspace <span className="text-red-400">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formState.name}
              onChange={handleChange("name")}
              required
              placeholder="VD: Team Marketing, Dự án ABC..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Mô tả (tùy chọn)
            </label>
            <textarea
              id="description"
              value={formState.description}
              onChange={handleChange("description")}
              rows={3}
              placeholder="Mô tả ngắn gọn về workspace..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Privacy Setting */}
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-200">
              Quyền riêng tư
            </label>
            <div className="space-y-3">
              {/* Public Option */}
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                  !formState.isPrivate
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-slate-700 bg-slate-800 hover:border-slate-600"
                }`}
              >
                <input
                  type="radio"
                  name="privacy"
                  checked={!formState.isPrivate}
                  onChange={() =>
                    setFormState((prev) => ({ ...prev, isPrivate: false }))
                  }
                  className="mt-1 h-4 w-4 text-indigo-500 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium text-white">Public</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    Ai có mã tham gia đều có thể vào trực tiếp
                  </p>
                </div>
              </label>

              {/* Private Option */}
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                  formState.isPrivate
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-slate-700 bg-slate-800 hover:border-slate-600"
                }`}
              >
                <input
                  type="radio"
                  name="privacy"
                  checked={formState.isPrivate}
                  onChange={() =>
                    setFormState((prev) => ({ ...prev, isPrivate: true }))
                  }
                  className="mt-1 h-4 w-4 text-indigo-500 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span className="font-medium text-white">Private</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    Cần admin phê duyệt mới có thể tham gia
                  </p>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-700 px-6 py-3 font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-600"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 font-semibold text-white transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isLoading}
            >
              <span className="absolute inset-0 opacity-0 blur-xl transition duration-500 group-hover:opacity-60">
                <span className="block h-full w-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400" />
              </span>
              <span className="relative">
                {isLoading ? "Đang tạo..." : "Tạo Workspace"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateWorkspaceModal;
