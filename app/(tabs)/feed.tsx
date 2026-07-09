import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";

interface FeedItem {
  id: string;
  tmdb_id: number;
  title: string;
  status: string;
  rating: number | null;
  updated_at: string;
  user_id: string;
  profiles: { username: string } | null;
}

const STATUS_VERB: Record<string, string> = {
  watching: "started watching",
  completed: "finished",
  plan_to_watch: "added to their plan-to-watch list",
};

export default function Feed() {
  const { session } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!session) return;
    setLoading(true);

    supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", session.user.id)
      .then(async ({ data: follows }) => {
        const followingIds = (follows ?? []).map((f) => f.following_id);
        if (followingIds.length === 0) {
          setItems([]);
          setLoading(false);
          return;
        }

        const { data } = await supabase
          .from("drama_entries")
          .select("id, tmdb_id, title, status, rating, updated_at, user_id, profiles(username)")
          .in("user_id", followingIds)
          .order("updated_at", { ascending: false })
          .limit(50);

        setItems((data as any) ?? []);
        setLoading(false);
      });
  }, [session]);

  useFocusEffect(load);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => router.push(`/drama/${item.tmdb_id}`)}
        >
          <Text style={styles.line}>
            <Text style={styles.username}>{item.profiles?.username ?? "Someone"}</Text>{" "}
            {STATUS_VERB[item.status] ?? "updated"} <Text style={styles.dramaTitle}>{item.title}</Text>
            {item.rating ? ` (★ ${item.rating}/10)` : ""}
          </Text>
        </Pressable>
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>
          Follow friends from their profile to see their activity here.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: "#f6f6f6", borderRadius: 8, padding: 12 },
  line: { fontSize: 15, lineHeight: 20 },
  username: { fontWeight: "700" },
  dramaTitle: { fontWeight: "600" },
  empty: { textAlign: "center", marginTop: 60, color: "#888", paddingHorizontal: 24 },
});
