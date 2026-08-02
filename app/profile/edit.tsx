import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { Avatar } from "../../components/Avatar";

export default function EditProfile() {
  const { session, profile, loading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null);
  const [username, setUsername] = useState(profile?.username ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!authLoading && !session) {
    return <Redirect href="/(auth)/login" />;
  }

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo library access to set a profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !session) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      const response = await fetch(asset.uri);
      const arrayBuffer = await response.arrayBuffer();
      const ext = asset.uri.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${session.user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, arrayBuffer, {
          contentType: asset.mimeType ?? "image/jpeg",
          upsert: true,
        });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
    } catch (err: any) {
      Alert.alert("Upload failed", err.message ?? "Could not upload image");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!session) return;
    if (!username.trim()) {
      Alert.alert("Username required");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ username: username.trim(), bio: bio.trim() || null, avatar_url: avatarUrl })
      .eq("id", session.user.id);
    setSaving(false);
    if (error) {
      Alert.alert("Couldn't save", error.message);
      return;
    }
    await refreshProfile();
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable style={styles.avatarWrap} onPress={pickAvatar} disabled={uploading}>
        <Avatar uri={avatarUrl} size={110} label={username} />
        <View style={styles.avatarOverlay}>
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.avatarOverlayText}>Change</Text>
          )}
        </View>
      </Pressable>

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholder="Username"
      />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, styles.bioInput]}
        value={bio}
        onChangeText={setBio}
        placeholder="Tell people a bit about yourself"
        multiline
      />

      <Pressable style={styles.saveButton} onPress={save} disabled={saving || uploading}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { alignItems: "center", padding: 24, paddingBottom: 48 },
  avatarWrap: { position: "relative" },
  avatarOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 32,
    borderBottomLeftRadius: 55,
    borderBottomRightRadius: 55,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarOverlayText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  label: {
    alignSelf: "flex-start",
    fontSize: 13,
    fontWeight: "700",
    color: "#666",
    marginTop: 24,
    marginBottom: 6,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  bioInput: { minHeight: 90, textAlignVertical: "top" },
  saveButton: {
    marginTop: 32,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: "#111",
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
