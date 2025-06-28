import React from "react";

const OfficeStaffDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Office Staff Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Document Management Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Document Management</h2>
          <div className="space-y-4">
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              Process Applications
            </button>
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
              Manage Records
            </button>
          </div>
        </div>

        {/* Administrative Tasks Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Administrative Tasks</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Pending Approvals</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                5 Tasks
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Document Requests</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                3 Pending
              </span>
            </div>
            <button className="w-full mt-4 bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600">
              View All Tasks
            </button>
          </div>
        </div>

        {/* Communication Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Communication</h2>
          <div className="space-y-4">
            <button className="w-full bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600">
              Send Notifications
            </button>
            <button className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
              View Messages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeStaffDashboard;
