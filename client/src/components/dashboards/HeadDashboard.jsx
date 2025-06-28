import React from "react";

const HeadDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Head Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Department Overview Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Department Overview</h2>
          <div className="space-y-2">
            <p>Total Scholars: 45</p>
            <p>Active Projects: 30</p>
            <p>Completed Projects: 15</p>
            <p>Pending Reviews: 8</p>
          </div>
        </div>

        {/* Project Management Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Project Management</h2>
          <div className="space-y-4">
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              View All Projects
            </button>
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
              Review Progress Reports
            </button>
          </div>
        </div>

        {/* Scholar Management Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Scholar Management</h2>
          <div className="space-y-4">
            <button className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600">
              View Scholar List
            </button>
            <button className="w-full bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600">
              Assign Supervisors
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeadDashboard;
