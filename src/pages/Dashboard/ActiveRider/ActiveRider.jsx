import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { FaUserSlash } from "react-icons/fa";

const ActiveRider = () => {
  const axiosSecure = useAxiosSecure();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch active riders
  const {
    data: riders = [],
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["active-riders"],
    queryFn: async () => {
      const res = await axiosSecure.get("/riders/active");
      return res.data;
    },
  });

  // Filter by search
  const filteredRiders = riders.filter((rider) =>
    rider.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Deactivate rider
  const handleDeactivate = async (id) => {
    const confirm = await Swal.fire({
      title: "Deactivate Rider?",
      text: "This will set the rider's status to inactive.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Deactivate",
    });

    if (confirm.isConfirmed) {
      try {
        await axiosSecure.patch(`/riders/status/${id}`, { status: "inactive" });
        refetch();
        Swal.fire("Deactivated", "Rider is now inactive.", "success");
      } catch (err) {
        Swal.fire("Error", "Failed to deactivate rider.", "error");
      }
    }
  };

  if (isLoading) return <p className="p-4">Loading active riders...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">🟢 Active Riders</h2>

      {/* Search input */}
      <input
        type="text"
        placeholder="Search by name..."
        className="input input-bordered w-full mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredRiders.length === 0 ? (
        <p>No active riders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Phone</th>
                <th>District</th>
                <th>Region</th>
                <th>Email</th>
                <th>Bike</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRiders.map((rider, index) => (
                <tr key={rider._id}>
                  <td>{index + 1}</td>
                  <td>{rider.name}</td>
                  <td>{rider.phone}</td>
                  <td>{rider.district}</td>
                  <td>{rider.region}</td>
                  <td>{rider.email}</td>
                  <td>{rider.bikeBrand}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => handleDeactivate(rider._id)}
                    >
                      <FaUserSlash className="inline-block mr-1" />
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ActiveRider;
