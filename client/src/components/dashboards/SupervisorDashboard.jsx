import React from "react";

const SupervisorDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Supervisor Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Scholar Management Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Scholar Management</h2>
          <div className="space-y-4">
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              View All Scholars
            </button>
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
              Add New Scholar
            </button>
          </div>
        </div>

        {/* Review Submissions Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Review Submissions</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Progress Reports</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                3 Pending
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Research Papers</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                2 Pending
              </span>
            </div>
            <button className="w-full mt-4 bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600">
              Review All Submissions
            </button>
          </div>
        </div>

        {/* Meeting Schedule Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Meeting Schedule</h2>
          <div className="space-y-4">
            <div className="border-b pb-2">
              <p className="font-medium">Today's Meetings</p>
              <p className="text-sm text-gray-600">2 meetings scheduled</p>
            </div>
            <button className="w-full bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600">
              Schedule New Meeting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
