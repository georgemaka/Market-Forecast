import { useState } from 'react';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@sukut.com",
      role: "Admin",
      status: "Active",
      department: "Management",
      lastLogin: "2024-12-20",
      joinedDate: "2023-01-15",
      avatar: null
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.johnson@sukut.com",
      role: "Project Manager",
      status: "Active",
      department: "Operations",
      lastLogin: "2024-12-19",
      joinedDate: "2023-03-10",
      avatar: null
    },
    {
      id: 3,
      name: "Michael Chen",
      email: "michael.chen@sukut.com",
      role: "Analyst",
      status: "Active",
      department: "Analytics",
      lastLogin: "2024-12-18",
      joinedDate: "2023-06-22",
      avatar: null
    },
    {
      id: 4,
      name: "Emily Rodriguez",
      email: "emily.rodriguez@sukut.com",
      role: "Viewer",
      status: "Inactive",
      department: "Finance",
      lastLogin: "2024-11-15",
      joinedDate: "2023-08-05",
      avatar: null
    },
    {
      id: 5,
      name: "David Wilson",
      email: "david.wilson@sukut.com",
      role: "Project Manager",
      status: "Active",
      department: "Environmental",
      lastLogin: "2024-12-20",
      joinedDate: "2023-02-28",
      avatar: null
    }
  ]);

  // Form state for new user
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Viewer',
    department: '',
    status: 'Active'
  });

  const roles = ['Admin', 'Project Manager', 'Analyst', 'Viewer'];
  const statuses = ['Active', 'Inactive', 'Pending'];
  const departments = ['Management', 'Operations', 'Analytics', 'Finance', 'Environmental', 'Solar', 'Residential', 'Public Works'];

  // Filter users based on search term, role, and status
  const filteredUsers = users.filter(user => {
    const searchMatch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const roleMatch = selectedRole === 'all' || user.role === selectedRole;
    const statusMatch = selectedStatus === 'all' || user.status === selectedStatus;
    
    return searchMatch && roleMatch && statusMatch;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800';
      case 'Project Manager':
        return 'bg-blue-100 text-blue-800';
      case 'Analyst':
        return 'bg-green-100 text-green-800';
      case 'Viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNewUserChange = (field: string, value: string) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.name || !newUser.email || !newUser.department) {
      alert('Please fill in all required fields');
      return;
    }

    const newUserData = {
      id: Math.max(...users.map(u => u.id)) + 1,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      department: newUser.department,
      lastLogin: 'Never',
      joinedDate: new Date().toISOString().split('T')[0],
      avatar: null
    };

    setUsers(prev => [...prev, newUserData]);
    
    // Reset form
    setNewUser({
      name: '',
      email: '',
      role: 'Viewer',
      department: '',
      status: 'Active'
    });
    setIsAddUserModalOpen(false);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;

    setUsers(prev => prev.map(user => 
      user.id === selectedUser.id ? selectedUser : user
    ));

    setIsEditUserModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const handleSelectedUserChange = (field: string, value: string) => {
    if (!selectedUser) return;
    
    setSelectedUser((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Users</h1>
            <p className="text-lg text-gray-600">Manage system users and permissions</p>
          </div>
          <button 
            onClick={() => setIsAddUserModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 bg-blue-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 bg-green-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'Active').length}</p>
              <p className="text-sm text-gray-500">Active Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="w-6 h-6 bg-purple-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'Admin').length}</p>
              <p className="text-sm text-gray-500">Admins</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <div className="w-6 h-6 bg-orange-600 rounded"></div>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{new Set(users.map(u => u.department)).size}</p>
              <p className="text-sm text-gray-500">Departments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <label htmlFor="search" className="sr-only">Search users</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="search"
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedRole !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedRole('all');
                setSelectedStatus('all');
              }}
              className="px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Filter Results */}
        {(searchTerm || selectedRole !== 'all' || selectedStatus !== 'all') && (
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
        </div>
        
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedRole !== 'all' || selectedStatus !== 'all' 
                ? "Try adjusting your search or filter criteria."
                : "No users have been added yet."}
            </p>
            {!searchTerm && selectedRole === 'all' && selectedStatus === 'all' && (
              <button 
                onClick={() => setIsAddUserModalOpen(true)}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Add your first user
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-700">
                              {getInitials(user.name)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">Add New User</h3>
                <button
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={newUser.name}
                      onChange={(e) => handleNewUserChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={newUser.email}
                      onChange={(e) => handleNewUserChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      id="role"
                      value={newUser.role}
                      onChange={(e) => handleNewUserChange('role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <select
                      id="department"
                      value={newUser.department}
                      onChange={(e) => handleNewUserChange('department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      id="status"
                      value={newUser.status}
                      onChange={(e) => handleNewUserChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditUserModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">Edit User</h3>
                <button
                  onClick={() => setIsEditUserModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="editName"
                      value={selectedUser.name}
                      onChange={(e) => handleSelectedUserChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="editEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="editEmail"
                      value={selectedUser.email}
                      onChange={(e) => handleSelectedUserChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="editRole" className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      id="editRole"
                      value={selectedUser.role}
                      onChange={(e) => handleSelectedUserChange('role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="editDepartment" className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <select
                      id="editDepartment"
                      value={selectedUser.department}
                      onChange={(e) => handleSelectedUserChange('department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="editStatus" className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      id="editStatus"
                      value={selectedUser.status}
                      onChange={(e) => handleSelectedUserChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditUserModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;