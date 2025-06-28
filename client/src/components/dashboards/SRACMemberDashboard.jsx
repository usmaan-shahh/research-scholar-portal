import React from "react";

const SRACMemberDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">SRAC Member Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Research Overview Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Research Overview</h2>
          <div className="space-y-2">
            <p>Active Research Projects: 25</p>
            <p>Pending Reviews: 10</p>
            <p>Completed Reviews: 35</p>
            <p>Upcoming Meetings: 3</p>
          </div>
        </div>

        {/* Review Management Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Review Management</h2>
          <div className="space-y-4">
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              Pending Reviews
            </button>
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
              Submit Review
            </button>
          </div>
        </div>

        {/* Meeting Management Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Meeting Management</h2>
          <div className="space-y-4">
            <button className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600">
              View Schedule
            </button>
            <button className="w-full bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600">
              Meeting Minutes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SRACMemberDashboard;
