import React from "react";

const DRCChairDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">DRC Chair Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Committee Overview Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Committee Overview</h2>
          <div className="space-y-2">
            <p>Active Members: 8</p>
            <p>Pending Decisions: 12</p>
            <p>Completed Reviews: 45</p>
            <p>Upcoming Meetings: 2</p>
          </div>
        </div>

        {/* Decision Management Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Decision Management</h2>
          <div className="space-y-4">
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              Pending Decisions
            </button>
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
              Review Proposals
            </button>
          </div>
        </div>

        {/* Committee Management Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Committee Management</h2>
          <div className="space-y-4">
            <button className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600">
              Manage Members
            </button>
            <button className="w-full bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600">
              Schedule Meetings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DRCChairDashboard;
