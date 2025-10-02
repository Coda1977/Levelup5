'use client';

import { useState, useEffect } from 'react';

type User = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: string;
  completed_chapters: number;
  total_chapters: number;
  progress_percentage: number;
  recent_completions: Array<{ chapter_id: string; completed_at: string }>;
};

type Stats = {
  total_users: number;
  active_users: number;
  average_progress: number;
  total_chapters: number;
};

export default function UserDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'joined' | 'active' | 'progress'>('joined');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}? This will remove all their data including progress and conversations.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
        alert('User deleted successfully');
        // Refresh stats
        fetchUsers();
      } else {
        const error = await response.json();
        alert(`Failed to delete user: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Filter and sort users
  const filteredUsers = users
    .filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'joined':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'active':
          const aTime = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
          const bTime = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
          return bTime - aTime;
        case 'progress':
          return b.progress_percentage - a.progress_percentage;
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-600">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="text-4xl font-bold text-gray-900">{stats.total_users}</div>
            <div className="text-sm text-gray-600 mt-2">Total Users</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="text-4xl font-bold text-accent-yellow">{stats.active_users}</div>
            <div className="text-sm text-gray-600 mt-2">Active (7 days)</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="text-4xl font-bold text-accent-green">{stats.average_progress}%</div>
            <div className="text-sm text-gray-600 mt-2">Average Progress</div>
          </div>
        </div>
      )}

      {/* Search and Sort */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-yellow focus:border-transparent"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-yellow focus:border-transparent"
          >
            <option value="joined">Sort by Joined Date</option>
            <option value="active">Sort by Last Active</option>
            <option value="progress">Sort by Progress</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Last Active</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Progress</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <>
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(user.last_sign_in_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[120px]">
                          <div
                            className="bg-accent-green h-full rounded-full transition-all"
                            style={{ width: `${user.progress_percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-16">
                          {user.progress_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          {expandedUser === user.id ? 'Hide' : 'View'} Details
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Details Row */}
                  {expandedUser === user.id && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <div className="text-xs text-gray-600">User ID</div>
                              <div className="text-sm font-mono text-gray-900 truncate">{user.id}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600">Completed</div>
                              <div className="text-sm font-semibold text-gray-900">
                                {user.completed_chapters}/{user.total_chapters} chapters
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600">Joined</div>
                              <div className="text-sm text-gray-900">
                                {new Date(user.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600">Last Sign In</div>
                              <div className="text-sm text-gray-900">
                                {user.last_sign_in_at 
                                  ? new Date(user.last_sign_in_at).toLocaleString()
                                  : 'Never'}
                              </div>
                            </div>
                          </div>

                          {user.recent_completions.length > 0 && (
                            <div>
                              <div className="text-sm font-semibold text-gray-900 mb-2">
                                Recent Completions
                              </div>
                              <div className="space-y-1">
                                {user.recent_completions.map((completion, idx) => (
                                  <div key={idx} className="text-sm text-gray-600">
                                    ✓ Completed {new Date(completion.completed_at).toLocaleDateString()}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? 'No users found matching your search' : 'No users yet'}
          </div>
        )}
      </div>
    </div>
  );
}