import { useState, useEffect, useRef } from "react";

const WEBSOCKET_URL = "ws://192.168.100.8:5000/ws";

export function useWebSocket() {
  const [connected, setConnected] = useState<boolean>(false);
  const [timeActive, setTimeActive] = useState<number>(0);
  const [consumption, setConsumption] = useState<number>(0);
  const [predictedConsumption, setPredictedConsumption] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<string>("Nunca");
  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(WEBSOCKET_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ source: "react_app", ping: true }));
    };

    ws.onmessage = (event) => {
      console.log("Mensaje recibido:", event.data);

      try {
        const data = JSON.parse(event.data);

        if (data.is_response) {
          setPredictedConsumption(data.predicted_consumption);
        } else if (data.time_active !== undefined) {
          setTimeActive((prevTime) => {
            const updatedTime = prevTime + data.time_active;
            setConsumption((prev) => prev + (data.consumption || 0));
            setLastUpdate(new Date().toLocaleTimeString());
            return updatedTime;
          });
        }
      } catch (error) {
        console.error("Error al procesar mensaje:", error);
      }
    };

    ws.onerror = () => setConnected(false);
    ws.onclose = () => setConnected(false);
  };

  const sendPredictionRequest = (timeValue: number) => {
    if (wsRef.current && connected && timeValue > 0) {
      wsRef.current.send(
        JSON.stringify({ source: "react_app", request_prediction: true, time_active: timeValue })
      );
    }
  };

  useEffect(() => {
    connectWebSocket();
    return () => wsRef.current?.close();
  }, []);

  return {
    connected,
    timeActive,
    consumption,
    predictedConsumption,
    lastUpdate,
    connectWebSocket,
    sendPredictionRequest,
  };
}
