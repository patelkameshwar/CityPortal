import React from "react";
import Hotels from "./Hotels";
import Events from "./Events";
import Tourism from "./Tourism";
import Blogs from "./Blogs";

function Home() {
  return (
    <div className="pt-16"> {/* padding-top for fixed navbar */}

      {/* Home Section */}
      <section id="home" className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center px-4">
          <h1 className="text-5xl font-bold text-blue-600 mb-4">
            Welcome to CityPortal
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Explore hotels, events, tourism spots, and blogs all in one place.
          </p>
        </div>
      </section>

      {/* Hotels Section */}
      <section id="hotels" className="bg-white">
        <Hotels />
      </section>

      {/* Events Section */}
      <section id="events" className="bg-gray-50">
        <Events />
      </section>

      {/* Tourism Section */}
      <section id="tourism" className="bg-white">
        <Tourism />
      </section>

      {/* Blogs Section */}
      <section id="blogs" className="bg-gray-50">
        <Blogs />
      </section>

    </div>
  );
}

export default Home;
