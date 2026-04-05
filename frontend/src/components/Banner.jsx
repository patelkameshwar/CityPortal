import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Banner = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row bg-gray-200 rounded-lg px-4 sm:px-6 md:px-10 lg:px-12 my-16 md:my-30 gap-6">
      {/* ________ Left Side _________ */}
      <div className="flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5">
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold text-gray-800">
          <p>Explore Our City</p>
          <p className="mt-2 text-lg text-gray-600">
            Visit the Site, Attend the Events, Stay In Premium Hotel <br />{" "}
            Update with City Blogs
          </p>
        </div>
        <button
          onClick={() => {
            navigate("/register");
            scrollTo(0, 0);
          }}
          className="bg-gray-800 text-gray-200 text-sm sm:text-base px-8 py-3 rounded-full mt-6 hover:scale-105 transition-all cursor-pointer"
        >
          Create account
        </button>
      </div>

      {/* ________ Right Side _________ */}
      {/* Mobile Image */}
      <div className="md:hidden w-full flex justify-center mt-2">
        <img
          className="w-full max-w-xs object-contain"
          src={assets.banner}
          alt=""
        />
      </div>

      {/* Desktop Image */}
      <div className="hidden md:block md:w-1/2 lg:w-117.5 relative">
        <img
          className="w-full absolute bottom-16 right-0 max-w-md h-100"
          src={assets.banner}
          alt=""
        />
      </div>
    </div>
  );
};

export default Banner;
