import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaUserPlus } from "react-icons/fa";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";

const AssignRider = () => {
  const axiosSecure = useAxiosSecure();
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch parcels to assign
  const { data: parcels = [], isLoading } = useQuery({
    queryKey: ["unassigned-parcels"],
    queryFn: async () => {
      const res = await axiosSecure.get(
        "/parcels?payment_status=paid&delivery_status=not_collected"
      );
      return res.data;
    },
  });

  const handleAssignRiderClick = (parcel) => {
    setSelectedParcel(parcel);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Assign Riders to Parcels</h2>

      {isLoading ? (
        <div className="text-center mt-10">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : parcels.length === 0 ? (
        <p className="text-gray-500">No unassigned parcels found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Sender</th>
                <th>Receiver</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {parcels.map((parcel) => (
                <tr key={parcel._id}>
                  <td>{parcel.tracking_id}</td>
                  <td>{parcel.sender_name}</td>
                  <td>{parcel.receiver_name}</td>
                  <td>{parcel.receiver_phone}</td>
                  <td>{parcel.receiver_address}</td>
                  <td>
                    <span className="badge badge-success">
                      {parcel.payment_status}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-warning">
                      {parcel.delivery_status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleAssignRiderClick(parcel)}
                      className="btn btn-sm btn-primary flex items-center gap-1"
                    >
                      <FaUserPlus /> Assign Rider
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && selectedParcel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-4">
              Assign Rider for:{" "}
              <span className="text-blue-600">
                {selectedParcel.tracking_id}
              </span>
            </h3>

            <RiderList
              district={selectedParcel.receiver_center}
              parcelId={selectedParcel._id}
              onClose={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Rider List component
const RiderList = ({ district, parcelId, onClose }) => {
  const axiosSecure = useAxiosSecure();

  const { data: riders = [], isLoading } = useQuery({
    queryKey: ["riders", district],
    enabled: !!district,
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/riders/available?district=${district}`
      );
      return res.data;
    },
  });

  const handleAssign = async (rider) => {
    try {
      const res = await axiosSecure.post(`/parcels/assign`, {
        parcelId,
        riderEmail: rider.email,
        assignedAt: new Date(),
      });

      if (res.data.success) {
        Swal.fire(
          "Assigned!",
          `${rider.name} assigned to the parcel.`,
          "success"
        );
        onClose();
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to assign rider", "error");
    }
  };

  return (
    <div>
      <h4 className="font-medium mb-2">
        Riders in <span className="text-green-600">{district}</span>
      </h4>

      {isLoading ? (
        <p>Loading...</p>
      ) : riders.length === 0 ? (
        <p className="text-sm text-red-500">
          No riders found in this district.
        </p>
      ) : (
        <ul className="space-y-2">
          {riders.map((rider) => (
            <li
              key={rider._id}
              className="flex justify-between items-center bg-gray-100 p-2 rounded"
            >
              <span>
                {rider.name} ({rider.email})
              </span>
              <button
                onClick={() => handleAssign(rider)}
                className="btn btn-xs btn-success"
              >
                Assign
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AssignRider;
