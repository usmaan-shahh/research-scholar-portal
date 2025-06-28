import React from "react";

const ScholarDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Scholar Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Research Progress Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Research Progress</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Literature Review</span>
              <span className="text-green-500">Completed</span>
            </div>
            <div className="flex justify-between">
              <span>Methodology</span>
              <span className="text-yellow-500">In Progress</span>
            </div>
            <div className="flex justify-between">
              <span>Data Collection</span>
              <span className="text-gray-500">Not Started</span>
            </div>
          </div>
        </div>

        {/* Submission Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Submissions</h2>
          <div className="space-y-4">
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              Submit Progress Report
            </button>
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
              Upload Documents
            </button>
          </div>
        </div>

        {/* Supervisor Communication Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            Supervisor Communication
          </h2>
          <div className="space-y-4">
            <button className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600">
              Schedule Meeting
            </button>
            <button className="w-full bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600">
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarDashboard;
