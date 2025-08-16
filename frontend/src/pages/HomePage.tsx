import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        Welcome to the Home Page
      </h1>
      <p className="text-lg text-secondary">
        This is a simple home page component styled with Tailwind CSS.
      </p>
      <button className="mt-6 px-4 py-2 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75">
        Get Started
      </button>
    </div>
  );
};

export default HomePage;
