import React, { useState, useEffect } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { FaUserShield, FaUserSlash } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";

const MakeAdmin = () => {
  const axiosSecure = useAxiosSecure();
  const [searchEmail, setSearchEmail] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");

  // Debounce user input - wait 500ms after last keystroke to trigger search
  useEffect(() => {
    const handler = setTimeout(
      () => setDebouncedEmail(searchEmail.trim()),
      500
    );
    return () => clearTimeout(handler);
  }, [searchEmail]);

  // Fetch users matching the debounced email query
  const {
    data: users = [],
    refetch,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["users", debouncedEmail],
    queryFn: async () => {
      if (!debouncedEmail) return [];
      const res = await axiosSecure.get(
        `/users/search?email=${debouncedEmail}`
      );
      return res.data;
    },
    enabled: !!debouncedEmail,
    keepPreviousData: true, // Keeps showing old results while loading new
  });

  // Handle role update (promote to admin / demote to user)
  const updateRole = async (id, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";

    const confirmResult = await Swal.fire({
      title: newRole === "admin" ? "Make Admin?" : "Remove Admin?",
      text: `Are you sure you want to ${
        newRole === "admin" ? "promote" : "demote"
      } this user?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await axiosSecure.patch(`/users/${id}/role`, { role: newRole });
      Swal.fire("Success", `User role updated to ${newRole}`, "success");
      refetch();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to update role", "error");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Manage Admins</h2>

      {/* Search input */}
      <input
        type="text"
        placeholder="Search users by email..."
        className="input input-bordered w-full max-w-md mx-auto mb-8 block"
        value={searchEmail}
        onChange={(e) => setSearchEmail(e.target.value)}
        autoComplete="off"
      />

      {/* Loading & error states */}
      {isFetching && (
        <div className="text-center my-6 text-blue-600 font-semibold">
          Loading users...
        </div>
      )}

      {isError && (
        <div className="text-center my-6 text-red-600 font-semibold">
          Error: {error.message || "Failed to load users."}
        </div>
      )}

      {!isFetching && !isError && debouncedEmail && users.length === 0 && (
        <p className="text-center text-gray-500">
          No users found for "{debouncedEmail}".
        </p>
      )}

      {/* Users table */}
      {users.length > 0 && (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Email</th>
                <th>Created At</th>
                <th>Role</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isAdmin = user.role === "admin";
                return (
                  <tr key={user._id}>
                    <td className="break-words max-w-xs">{user.email}</td>
                    <td>
                      {" "}
                      {user.create_at
                        ? new Date(user.create_at).toLocaleDateString("en-GB")
                        : "N/A"}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          isAdmin ? "badge-success" : "badge-outline"
                        }`}
                      >
                        {isAdmin ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() =>
                          updateRole(user._id, user.role || "user")
                        }
                        className={`btn btn-sm flex items-center gap-2 ${
                          isAdmin ? "btn-error" : "btn-success"
                        }`}
                      >
                        {isAdmin ? <FaUserSlash /> : <FaUserShield />}
                        {isAdmin ? "Remove Admin" : "Make Admin"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MakeAdmin;
