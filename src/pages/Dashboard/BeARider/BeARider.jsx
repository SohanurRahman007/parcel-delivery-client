import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { useLoaderData } from "react-router";

const BeARider = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const serviceCenterData = useLoaderData();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const [districts, setDistricts] = useState([]);
  const [regions, setRegions] = useState([]);

  const selectedDistrict = watch("district");

  // Extract unique districts
  useEffect(() => {
    const uniqueDistricts = [
      ...new Set(serviceCenterData.map((center) => center.district)),
    ];
    setDistricts(uniqueDistricts);
  }, [serviceCenterData]);

  // Update regions when district changes
  useEffect(() => {
    const relatedRegions = serviceCenterData
      .filter((center) => center.district === selectedDistrict)
      .map((center) => center.region);

    const uniqueRegions = [...new Set(relatedRegions)];
    setRegions(uniqueRegions);
    setValue("region", ""); // reset region
  }, [selectedDistrict, setValue, serviceCenterData]);

  const onSubmit = async (data) => {
    data.email = user?.email;
    data.status = "pending";
    data.applied_at = new Date();

    try {
      const res = await axiosSecure.post("/riders", data);
      if (res.data.insertedId) {
        Swal.fire({
          title: "Application Submitted!",
          text: "Your rider application is under review.",
          icon: "success",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Submission Failed",
        text: "Please try again later.",
        icon: "error",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-base-200 p-8 rounded-xl shadow-lg mt-10">
      <h2 className="text-3xl font-bold mb-8 text-center text-primary">
        🚴 Apply to Be a Rider
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Name */}
        <div>
          <label className="label">Name</label>
          <input
            type="text"
            readOnly
            value={user?.displayName || ""}
            className="input input-bordered  w-full"
            {...register("name")}
          />
        </div>

        {/* Age */}
        <div>
          <label className="label">Age</label>
          <input
            type="number"
            {...register("age", { required: true, min: 18 })}
            className="input input-bordered w-full"
            placeholder="18+"
          />
          {errors.age && (
            <p className="text-red-500 text-sm">Minimum age is 18</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="label">Phone Number</label>
          <input
            type="tel"
            className="input input-bordered w-full"
            placeholder="e.g. 017xxxxxxxx"
          />
        </div>

        {/* NID */}
        <div>
          <label className="label">National ID Number</label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Enter your NID"
          />
        </div>

        {/* Bike Brand */}
        <div>
          <label className="label">Bike Brand</label>
          <input
            type="text"
            {...register("bikeBrand", { required: true })}
            className="input input-bordered w-full"
            placeholder="e.g., Yamaha, Honda"
          />
          {errors.bikeBrand && (
            <p className="text-red-500 text-sm">Bike brand is required</p>
          )}
        </div>

        {/* Bike Registration */}
        <div>
          <label className="label">Bike Registration Number</label>
          <input
            type="text"
            {...register("bikeReg", { required: true })}
            className="input input-bordered w-full"
            placeholder="e.g., DHA-123456"
          />
          {errors.bikeReg && (
            <p className="text-red-500 text-sm">
              Registration number is required
            </p>
          )}
        </div>

        {/* District */}
        <div>
          <label className="label">District</label>
          <select
            {...register("district", { required: true })}
            className="select select-bordered w-full"
          >
            <option value="">-- Select District --</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
          {errors.district && (
            <p className="text-red-500 text-sm">District is required</p>
          )}
        </div>

        {/* Region - now selectable */}
        <div>
          <label className="label">Region</label>
          <select
            {...register("region", { required: true })}
            className="select select-bordered w-full"
            disabled={regions.length === 0}
          >
            <option value="">-- Select Region --</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          {errors.region && (
            <p className="text-red-500 text-sm">Region is required</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2">
          <button className="btn btn-primary w-full mt-4">
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
};

export default BeARider;
