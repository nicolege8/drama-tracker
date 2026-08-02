import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import type { DramaEntry, Profile } from "../../lib/types";
import { Avatar } from "../../components/Avatar";
import { CollectionCarousels } from "../../components/CollectionCarousels";

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<DramaEntry[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => setProfile(data ?? null));

    supabase
      .from("drama_entries")
      .select("*")
      .eq("user_id", id)
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        setEntries(data ?? []);
        setLoading(false);
      });

    if (session) {
      supabase
        .from("follows")
        .select("*")
        .eq("follower_id", session.user.id)
        .eq("following_id", id)
        .maybeSingle()
        .then(({ data }) => setIsFollowing(!!data));
    }
  }, [id, session]);

  const toggleFollow = async () => {
    if (!session) return;
    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", session.user.id)
        .eq("following_id", id);
    } else {
      await supabase.from("follows").insert({ follower_id: session.user.id, following_id: id });
    }
    setIsFollowing(!isFollowing);
  };

  if (!authLoading && !session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: profile?.username ?? "Profile" }} />

      <View style={styles.header}>
        <Avatar uri={profile?.avatar_url ?? null} size={90} label={profile?.username} />
        <Text style={styles.username}>{profile?.username ?? "..."}</Text>
        <Text style={styles.bio}>{profile?.bio || "No bio yet."}</Text>

        {session?.user.id !== id && (
          <Pressable
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={toggleFollow}
          >
            <Text style={[styles.followText, isFollowing && styles.followingText]}>
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </Pressable>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      ) : (
        <CollectionCarousels entries={entries} emptyMessage="No dramas tracked yet." />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { paddingVertical: 40, alignItems: "center" },
  header: { alignItems: "center", padding: 24, paddingTop: 32 },
  username: { fontSize: 20, fontWeight: "700", marginTop: 12, textAlign: "center" },
  bio: { marginTop: 6, fontSize: 14, color: "#666", textAlign: "center", lineHeight: 20 },
  followButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "#111",
  },
  followingButton: { backgroundColor: "#eee" },
  followText: { color: "#fff", fontWeight: "600" },
  followingText: { color: "#111" },
});
