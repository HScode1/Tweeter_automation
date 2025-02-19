'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Account {
  id: string;
  platform: string;
  username: string;
  createdAt: string;
}

export default function AccountsPage() {
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/accounts');
        if (!response.ok) {
          throw new Error('Failed to fetch accounts');
        }
        const data = await response.json();
        setAccounts(data);
      } catch (err) {
        setError('Failed to load accounts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchAccounts();
    }
  }, [session]);

  const handleDisconnect = async () => {
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'disconnect' }),
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect account');
      }

      // Refresh accounts list
      const updatedAccounts = accounts.filter(account => account.platform !== 'twitter');
      setAccounts(updatedAccounts);
    } catch (err) {
      setError('Failed to disconnect account');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Connected Accounts</h1>
      {accounts.length === 0 ? (
        <p>No accounts connected</p>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="p-4 border rounded-lg flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold">{account.username}</h2>
                <p className="text-sm text-gray-500">
                  Platform: {account.platform}
                </p>
                <p className="text-sm text-gray-500">
                  Connected on: {new Date(account.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Disconnect
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
