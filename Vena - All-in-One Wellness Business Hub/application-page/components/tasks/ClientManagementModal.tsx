import React, { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';
import { Client, ClientGroup } from '../../types/tasks';

interface ClientManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onDataChange: () => void;
  clients: Client[];
  clientGroups: ClientGroup[];
}

const ClientManagementModal: React.FC<ClientManagementModalProps> = ({
  isOpen,
  onClose,
  user,
  onDataChange,
  clients,
  clientGroups
}) => {
  const [activeTab, setActiveTab] = useState<'clients' | 'groups'>('clients');
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [editingGroup, setEditingGroup] = useState<ClientGroup | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setNewClientName('');
      setNewClientEmail('');
      setNewGroupName('');
      setSelectedClients([]);
      setEditingGroup(null);
    }
  }, [isOpen]);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newClientName.trim() || !newClientEmail.trim()) return;

    try {
      const { error } = await supabase
        .from('clients')
        .insert({
          client_name: newClientName.trim(),
          client_email: newClientEmail.trim(),
          creator_user_id: user.id
        });

      if (error) throw error;

      setNewClientName('');
      setNewClientEmail('');
      onDataChange();
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Error adding client: ' + (error as Error).message);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;
      onDataChange();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error deleting client: ' + (error as Error).message);
    }
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newGroupName.trim() || selectedClients.length === 0) return;

    try {
      const { data: group, error: groupError } = await supabase
        .from('client_groups')
        .insert({
          group_name: newGroupName.trim(),
          creator_user_id: user.id
        })
        .select()
        .single();

      if (groupError) throw groupError;

      const groupMembers = selectedClients.map(clientId => ({
        group_id: group.id,
        client_id: clientId
      }));

      const { error: membersError } = await supabase
        .from('group_members')
        .insert(groupMembers);

      if (membersError) throw membersError;

      setNewGroupName('');
      setSelectedClients([]);
      onDataChange();
    } catch (error) {
      console.error('Error adding group:', error);
      alert('Error adding group: ' + (error as Error).message);
    }
  };

  const handleEditGroup = (group: ClientGroup) => {
    setEditingGroup(group);
    setNewGroupName(group.name);
    setSelectedClients([...group.clientIds]);
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup || !newGroupName.trim()) return;

    try {
      const { error: groupError } = await supabase
        .from('client_groups')
        .update({ group_name: newGroupName.trim() })
        .eq('id', editingGroup.id);

      if (groupError) throw groupError;

      const { error: deleteError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', editingGroup.id);

      if (deleteError) throw deleteError;

      if (selectedClients.length > 0) {
        const groupMembers = selectedClients.map(clientId => ({
          group_id: editingGroup.id,
          client_id: clientId
        }));

        const { error: membersError } = await supabase
          .from('group_members')
          .insert(groupMembers);

        if (membersError) throw membersError;
      }

      setEditingGroup(null);
      setNewGroupName('');
      setSelectedClients([]);
      onDataChange();
    } catch (error) {
      console.error('Error updating group:', error);
      alert('Error updating group: ' + (error as Error).message);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;

    try {
      const { error } = await supabase
        .from('client_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;
      onDataChange();
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Error deleting group: ' + (error as Error).message);
    }
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Manage Clients & Groups</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            title="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'clients'
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Clients
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'groups'
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Groups
            </button>
          </nav>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {activeTab === 'clients' ? (
            <div>
              <form onSubmit={handleAddClient} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Add New Client</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Client Name"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Client Email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  Add Client
                </button>
              </form>

              <div className="space-y-3">
                <h3 className="text-lg font-medium">Existing Clients</h3>
                {clients.length === 0 ? (
                  <p className="text-gray-500">No clients yet. Add your first client above.</p>
                ) : (
                  clients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center">
                          <span className="text-purple-600 font-semibold text-sm">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-500">{client.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div>
              <form 
                onSubmit={editingGroup ? handleUpdateGroup : handleAddGroup} 
                className="mb-6 p-4 bg-gray-50 rounded-lg"
              >
                <h3 className="text-lg font-medium mb-4">
                  {editingGroup ? 'Edit Group' : 'Add New Group'}
                </h3>
                <input
                  type="text"
                  placeholder="Group Name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                  required
                />
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Select Clients:</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {clients.map((client) => (
                      <label key={client.id} className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded">
                        <input
                          type="checkbox"
                          checked={selectedClients.includes(client.id)}
                          onChange={() => toggleClientSelection(client.id)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <div className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center">
                          <span className="text-purple-600 font-semibold text-xs">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium">{client.name}</span>
                        <span className="text-xs text-gray-500">({client.email})</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                  >
                    {editingGroup ? 'Update Group' : 'Add Group'}
                  </button>
                  {editingGroup && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingGroup(null);
                        setNewGroupName('');
                        setSelectedClients([]);
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="space-y-3">
                <h3 className="text-lg font-medium">Existing Groups</h3>
                {clientGroups.length === 0 ? (
                  <p className="text-gray-500">No groups yet. Add your first group above.</p>
                ) : (
                  clientGroups.map((group) => (
                    <div key={group.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">{group.name}</div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditGroup(group)}
                            className="text-purple-600 hover:text-purple-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {group.clientIds.length} member{group.clientIds.length !== 1 ? 's' : ''}:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.clientIds.map((clientId) => {
                          const client = clients.find(c => c.id === clientId);
                          return client ? (
                            <div key={clientId} className="flex items-center space-x-2 bg-purple-100 px-3 py-1 rounded-full">
                              <div className="h-6 w-6 rounded-full bg-purple-300 flex items-center justify-center">
                                <span className="text-purple-700 font-semibold text-xs">
                                  {client.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-purple-800">{client.name}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientManagementModal;
