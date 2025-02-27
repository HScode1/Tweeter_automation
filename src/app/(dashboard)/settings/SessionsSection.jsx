"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/nextjs";

const SessionsSection = () => {
  const { user } = useClerk();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, you would fetch active sessions from Clerk
    // This is a placeholder implementation
    const mockSessions = [
      { id: '1', device: 'Chrome on Windows', lastActive: new Date().toISOString(), current: true },
      { id: '2', device: 'Safari on iPhone', lastActive: new Date(Date.now() - 86400000).toISOString(), current: false },
    ];
    
    setSessions(mockSessions);
    setLoading(false);
  }, []);

  const handleRevokeSession = (sessionId) => {
    // In a real implementation, you would call Clerk API to revoke the session
    setSessions(sessions.filter(session => session.id !== sessionId));
  };

  const handleRevokeAllSessions = () => {
    // In a real implementation, you would call Clerk API to revoke all sessions except current
    setSessions(sessions.filter(session => session.current));
  };

  if (loading) return <p>Chargement des sessions...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions actives</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <p>Aucune session active</p>
        ) : (
          <div className="space-y-4">
            {sessions.map(session => (
              <div key={session.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">{session.device} {session.current && "(Session actuelle)"}</p>
                  <p className="text-sm text-gray-500">Dernière activité: {new Date(session.lastActive).toLocaleString()}</p>
                </div>
                {!session.current && (
                  <Button variant="destructive" size="sm" onClick={() => handleRevokeSession(session.id)}>
                    Révoquer
                  </Button>
                )}
              </div>
            ))}
            
            {sessions.length > 1 && (
              <Button variant="outline" onClick={handleRevokeAllSessions}>
                Révoquer toutes les autres sessions
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionsSection;
