import React, { useState } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { FaCheckCircle, FaTimesCircle, FaEye } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";

const PendingRider = () => {
  const axiosSecure = useAxiosSecure();
  const [selectedRider, setSelectedRider] = useState(null);

  // ✅ Fetch pending riders with React Query
  const {
    isPending,
    data: riders = [],
    refetch,
  } = useQuery({
    queryKey: ["pending-rider"],
    queryFn: async () => {
      const res = await axiosSecure.get("/riders/pending");
      return res.data;
    },
  });

  if (isPending) {
    return <div className="text-center py-8">Loading riders...</div>;
  }

  // ✅ Approve rider
  const handleApprove = async (id) => {
    const confirm = await Swal.fire({
      title: "Approve Rider?",
      text: "They will become an active rider.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve",
    });

    if (confirm.isConfirmed) {
      try {
        await axiosSecure.patch(`/riders/status/${id}`, { status: "active" });
        refetch(); // Refresh rider list
        Swal.fire("Approved!", "Rider is now active.", "success");
      } catch (err) {
        console.log(err);
        Swal.fire("Failed", "Something went wrong.", "error");
      }
    }
  };

  // ✅ Reject rider
  const handleReject = async (id) => {
    const confirm = await Swal.fire({
      title: "Reject Application?",
      text: "Are you sure you want to cancel this application?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reject",
    });

    if (confirm.isConfirmed) {
      try {
        await axiosSecure.delete(`/riders/${id}`);
        refetch(); // Refresh list
        Swal.fire("Rejected", "Application has been cancelled.", "info");
      } catch (err) {
        console.log(err);
        Swal.fire("Failed", "Could not cancel application.", "error");
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">🚴 Pending Rider Applications</h2>
      {riders.length === 0 ? (
        <p className="text-center text-gray-500">No pending applications.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Phone</th>
                <th>District</th>
                <th>Applied At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {riders.map((rider, index) => (
                <tr key={rider._id}>
                  <td>{index + 1}</td>
                  <td>{rider.name}</td>
                  <td>{rider.phone}</td>
                  <td>{rider.district}</td>
                  <td>
                    {new Date(rider.applied_at).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="flex gap-1">
                    <button
                      className="btn btn-xs btn-info"
                      onClick={() => setSelectedRider(rider)}
                    >
                      <FaEye /> View
                    </button>
                    <button
                      className="btn btn-xs btn-success"
                      onClick={() => handleApprove(rider._id)}
                    >
                      <FaCheckCircle /> Approve
                    </button>
                    <button
                      className="btn btn-xs btn-error"
                      onClick={() => handleReject(rider._id)}
                    >
                      <FaTimesCircle /> Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rider Modal */}
      {selectedRider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-base-200 p-6 rounded-xl max-w-lg w-full relative">
            <h3 className="text-xl font-bold mb-4">Rider Details</h3>
            <ul className="space-y-2">
              <li>
                <strong>Name:</strong> {selectedRider.name}
              </li>
              <li>
                <strong>Email:</strong> {selectedRider.email}
              </li>
              <li>
                <strong>Phone:</strong> {selectedRider.phone}
              </li>
              <li>
                <strong>NID:</strong> {selectedRider.nid}
              </li>
              <li>
                <strong>Bike Brand:</strong> {selectedRider.bikeBrand}
              </li>
              <li>
                <strong>Bike Reg:</strong> {selectedRider.bikeReg}
              </li>
              <li>
                <strong>District:</strong> {selectedRider.district}
              </li>
              <li>
                <strong>Region:</strong> {selectedRider.region}
              </li>
              <li>
                <strong>Applied At:</strong>{" "}
                {new Date(selectedRider.applied_at).toLocaleString()}
              </li>
            </ul>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleApprove(selectedRider._id)}
              >
                Approve
              </button>
              <button
                className="btn btn-error btn-sm"
                onClick={() => handleReject(selectedRider._id)}
              >
                Reject
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedRider(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRider;
