import { useEffect, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;
    
    const connect = () => {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        setTimeout(connect, 3000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          switch (data.type) {
            case 'initial_data':
            case 'system_update':
              // Invalidate and refetch system data
              queryClient.invalidateQueries({ queryKey: ["/api/system/overview"] });
              break;
            case 'new_log':
              // Invalidate logs query
              queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
              break;
            case 'broadcast_message':
              // Invalidate broadcast messages query to refresh the list
              queryClient.invalidateQueries({ queryKey: ["/api/broadcast"] });
              console.log('New broadcast message received:', data.message);
              break;
            case 'broadcast':
              // Handle broadcast type messages too
              queryClient.invalidateQueries({ queryKey: ["/api/broadcast"] });
              console.log('Broadcast received:', data);
              break;
            default:
              console.log('Unknown message type:', data.type, data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    };
    
    connect();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [queryClient]);

  return { isConnected };
}
