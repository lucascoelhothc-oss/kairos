import { TouchableOpacity, View, Alert } from "react-native";
import { Audio } from "expo-av";
import { API_BASE } from "../constants/api";
import { getToken } from "../utils/storage";
import { useState } from "react";

export default function VoiceButton() {
  const [recording, setRecording] = useState();

  const start = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(rec);
    } catch (err) { Alert.alert("Erro", "Sem permissão de microfone."); }
  };

  const stop = async () => {
    if (!recording) return;
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    const t = await getToken();

    const form = new FormData();
    form.append("audio", { uri, name: "audio.m4a", type: "audio/m4a" });

    try {
      const r = await fetch(`${API_BASE}/voice/transcribe`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${t}` },
        body: form
      });
      const d = await r.json();
      Alert.alert("Kairós Ouviu", d.text || "Nada captado.");
    } catch (e) { Alert.alert("Erro", "Falha no envio."); }
  };

  return (
    <TouchableOpacity onPressIn={start} onPressOut={stop} style={{ width: 50, height: 50, backgroundColor: recording ? '#ff0000' : '#333', borderRadius: 25, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: 20, height: 20, backgroundColor: 'white', borderRadius: 10 }} />
    </TouchableOpacity>
  );
}