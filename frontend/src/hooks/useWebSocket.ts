import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  shouldReconnect?: boolean;
  reconnectInterval?: number;
}

export function useWebSocket(url: string | null, options: UseWebSocketOptions = {}) {
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('closed');
  const wsRef = useRef<WebSocket | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const connect = useCallback(() => {
    if (!url) return;
    
    setStatus('connecting');
    // Ensure we resolve relative WS URLs correctly.
    // Vercel does not support WebSocket proxying, so we must connect directly to Render in production.
    let socketUrl = url;
    if (!url.startsWith('ws')) {
      if (window.location.hostname.includes('vercel.app')) {
        socketUrl = `wss://quick-style-bckend.onrender.com${url}`;
      } else {
        socketUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${url}`;
      }
    }
      
    const ws = new WebSocket(socketUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('open');
      optionsRef.current.onOpen?.();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        optionsRef.current.onMessage?.(data);
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };

    ws.onclose = () => {
      setStatus('closed');
      optionsRef.current.onClose?.();
      
      if (optionsRef.current.shouldReconnect) {
        setTimeout(() => {
          connect();
        }, optionsRef.current.reconnectInterval || 3000);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }, [url]);

  useEffect(() => {
    if (!url) return;
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url, connect]);

  const send = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }, []);

  return { status, send };
}
