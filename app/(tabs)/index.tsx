import React, { useState, useEffect, useRef } from "react";
import { Image, StyleSheet, Text, View, Button } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useWebSocket } from "../websocket/socket_service";
import Slider from "@react-native-community/slider";

export default function HomeScreen() {
  const {
    connected,
    timeActive,
    consumption,
    predictedConsumption,
    lastUpdate,
    connectWebSocket,
    sendPredictionRequest,
  } = useWebSocket();
  
  const [timeToPredict, setTimeToPredict] = useState<number>(1);
  const isDraggingRef = useRef<boolean>(false);
  useEffect(() => {
    if (connected && timeActive > 0) {
      sendPredictionRequest(timeActive + timeToPredict);
    }
  }, [timeActive, timeToPredict, connected]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title">Monitoreo ESP8266</ThemedText>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, { color: connected ? "green" : "red" }]}>
            Estado: {connected ? "Conectado" : "Desconectado"}
          </Text>
          <Text style={styles.timestampText}>Última actualización: {lastUpdate}</Text>
        </View>
        <Button title="Reconectar" onPress={connectWebSocket} />
        <View style={styles.dataContainer}>
          <Text style={styles.dataText}>Has estado usando agua por {timeActive} segundos</Text>
          <Text style={styles.dataText}>Has consumido {consumption.toFixed(2)} litros de agua</Text>
          <Text style={styles.dataText}>Estas por consumir {(predictedConsumption ?? 0).toFixed(2)} litros de agua</Text>
        </View>
        <View style={styles.sliderContainer}>
          <Text style={styles.dataText}>Predecir para: {timeToPredict} segundos despues</Text>
          <Slider
            style={{ width: 320, height: 80 }} 
            minimumValue={1}
            maximumValue={60}
            step={1}
            value={timeToPredict}
            onSlidingStart={() => {
              isDraggingRef.current = true;
            }}
            onSlidingComplete={(value) => {
              isDraggingRef.current = false;
              setTimeToPredict(value);
              if (connected && timeActive > 0) {
                sendPredictionRequest(timeActive + value);
              }
            }}
            onValueChange={(value) => {
              if (isDraggingRef.current) {
                if (Math.abs(value - timeToPredict) >= 1) {
                  setTimeToPredict(Math.round(value));
                }
              }
            }}
            minimumTrackTintColor="#69cdff"
            maximumTrackTintColor="#1cb3ff"
            thumbTintColor="#1cb3ff"
          />
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center" },
  statusContainer: { marginVertical: 10, alignItems: "center" },
  statusText: { fontSize: 16, fontWeight: "bold" },
  timestampText: { fontSize: 12, color: "#666", marginTop: 5 },
  dataContainer: {
    marginTop: 20,
    alignItems: "flex-start",
    backgroundColor: "rgba(0,0,0,0.1)",
    padding: 15,
    borderRadius: 10,
    width: "100%",
  },
  sliderContainer: {
    alignItems: "center",
    marginVertical: 20,
    height: 500
  },
  dataText: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
    color: "white",
  },
  reactLogo: { height: 178, width: 290, bottom: 0, left: 0, position: "absolute" },
});