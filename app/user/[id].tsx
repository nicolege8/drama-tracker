import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import type { DramaEntry, Profile } from "../../lib/types";
import { DramaCard } from "../../components/DramaCard";

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<DramaEntry[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    supabase.from("profiles").select("*").eq("id", id).single().then(({ data }) => {
      setProfile(data ?? null);
    });

    supabase
      .from("drama_entries")
      .select("*")
      .eq("user_id", id)
      .order("updated_at", { ascending: false })
      .then(({ data }) => setEntries(data ?? []));

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
      await supabase
        .from("follows")
        .insert({ follower_id: session.user.id, following_id: id });
    }
    setIsFollowing(!isFollowing);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: profile?.username ?? "Profile" }} />
      <Text style={styles.username}>{profile?.username ?? "..."}</Text>

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

      <Text style={styles.sectionTitle}>Collection</Text>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 16 }}
        renderItem={({ item }) => (
          <DramaCard
            tmdbId={item.tmdb_id}
            title={item.title}
            posterPath={item.poster_path}
            subtitle={item.rating ? `★ ${item.rating}/10` : undefined}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No dramas tracked yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  username: { fontSize: 24, fontWeight: "700" },
  followButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#111",
  },
  followingButton: { backgroundColor: "#eee" },
  followText: { color: "#fff", fontWeight: "600" },
  followingText: { color: "#111" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 24, marginBottom: 8 },
  empty: { color: "#888" },
});
