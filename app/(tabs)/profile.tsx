import { useEffect, useState } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { Avatar } from "../../components/Avatar";

export default function ProfileScreen() {
  const { session, profile, signOut } = useAuth();
  const router = useRouter();
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", session.user.id)
      .then(({ count }) => setFollowerCount(count ?? 0));

    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", session.user.id)
      .then(({ count }) => setFollowingCount(count ?? 0));
  }, [session]);

  const shareProfile = () => {
    if (!profile) return;
    Share.share({
      message: `Check out ${profile.username}'s profile on Drama Tracker: dramatracker://user/${profile.id}`,
    });
  };

  return (
    <View style={styles.container}>
      <Avatar uri={profile?.avatar_url ?? null} size={110} />
      <Text style={styles.username}>{profile?.username ?? "..."}</Text>
      <Text style={styles.bio}>{profile?.bio || "No bio yet."}</Text>

      <View style={styles.statsRow}>
        <Text style={styles.stat}>{followerCount} followers</Text>
        <Text style={styles.stat}>{followingCount} following</Text>
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={styles.primaryButton} onPress={() => router.push("/profile/edit")}>
          <Text style={styles.primaryButtonText}>Edit Profile</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={shareProfile}>
          <Text style={styles.secondaryButtonText}>Share Profile</Text>
        </Pressable>
      </View>

      <Pressable style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: 24, paddingTop: 48 },
  username: { fontSize: 22, fontWeight: "700", marginTop: 16, textAlign: "center" },
  bio: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  statsRow: { flexDirection: "row", gap: 24, marginTop: 20 },
  stat: { color: "#666" },
  actionsRow: { flexDirection: "row", gap: 12, marginTop: 24 },
  primaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#111",
  },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  secondaryButtonText: { color: "#333", fontWeight: "700" },
  signOutButton: { marginTop: 32 },
  signOutText: { color: "#999", fontWeight: "600" },
});
