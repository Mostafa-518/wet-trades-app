
const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Wet Trades - Orascom</h1>
        <p className="text-xl text-gray-600 mb-8">Manage your construction projects, subcontractors, and trades efficiently.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Projects</h3>
            <p className="text-gray-600">Track and manage all your construction projects in one place.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Subcontractors</h3>
            <p className="text-gray-600">Manage your network of trusted subcontractors and their specialties.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Trades</h3>
            <p className="text-gray-600">Organize work by trade categories and manage trade items.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
