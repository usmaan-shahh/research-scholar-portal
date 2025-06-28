import React from "react";

const DRCStaffDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">DRC Member Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Research Committee Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Research Committee</h2>
          <div className="space-y-4">
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              View Committee Members
            </button>
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
              Schedule Meetings
            </button>
          </div>
        </div>

        {/* Research Reviews Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Research Reviews</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Proposal Reviews</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                4 Pending
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Thesis Reviews</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                2 Pending
              </span>
            </div>
            <button className="w-full mt-4 bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600">
              Review All Submissions
            </button>
          </div>
        </div>

        {/* Reports Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Reports & Analytics</h2>
          <div className="space-y-4">
            <button className="w-full bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600">
              Generate Reports
            </button>
            <button className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DRCStaffDashboard;
