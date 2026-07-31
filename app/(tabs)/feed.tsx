import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { Avatar } from "../../components/Avatar";
import { relativeTime } from "../../lib/format";
import type { Profile } from "../../lib/types";

interface FeedItem {
  id: string;
  tmdb_id: number;
  title: string;
  rating: number | null;
  updated_at: string;
  user_id: string;
  profiles: { username: string; avatar_url: string | null } | null;
}

export default function Feed() {
  const { session } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);

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
          .select("id, tmdb_id, title, rating, updated_at, user_id, profiles(username, avatar_url)")
          .eq("status", "completed")
          .in("user_id", followingIds)
          .order("updated_at", { ascending: false })
          .limit(50);

        setItems((data as any) ?? []);
        setLoading(false);
      });
  }, [session]);

  useFocusEffect(load);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${query}%`)
        .neq("id", session?.user.id ?? "")
        .limit(20)
        .then(({ data }) => setResults(data ?? []));
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, session]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Find friends by username..."
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
      />

      {query.trim() ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.userRow}
              onPress={() => {
                setQuery("");
                router.push(`/user/${item.id}`);
              }}
            >
              <Avatar uri={item.avatar_url} size={36} />
              <Text style={styles.userRowText}>{item.username}</Text>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No users found.</Text>}
        />
      ) : loading ? (
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/drama/${item.tmdb_id}`)}
            >
              <Avatar uri={item.profiles?.avatar_url ?? null} size={40} />
              <View style={styles.cardBody}>
                <Text style={styles.line}>
                  <Text style={styles.username}>{item.profiles?.username ?? "Someone"}</Text>
                  {" completed "}
                  <Text style={styles.dramaTitle}>{item.title}</Text>
                </Text>
                {item.rating ? (
                  <View style={styles.starsRow}>
                    {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                      <Ionicons
                        key={n}
                        name={n <= item.rating! ? "star" : "star-outline"}
                        size={14}
                        color="#f5a623"
                      />
                    ))}
                  </View>
                ) : null}
                <Text style={styles.timestamp}>{relativeTime(item.updated_at)}</Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              Follow friends from their profile to see their completed dramas here.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  search: {
    margin: 16,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  userRowText: { fontSize: 16 },
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#f6f6f6",
    borderRadius: 8,
    padding: 12,
  },
  cardBody: { flex: 1, gap: 4 },
  line: { fontSize: 15, lineHeight: 20 },
  username: { fontWeight: "700" },
  dramaTitle: { fontWeight: "600" },
  starsRow: { flexDirection: "row", gap: 2 },
  timestamp: { fontSize: 12, color: "#999" },
  empty: { textAlign: "center", marginTop: 60, color: "#888", paddingHorizontal: 24 },
});
