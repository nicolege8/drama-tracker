import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { Avatar } from "../../components/Avatar";
import { relativeTime } from "../../lib/format";
import { posterUrl } from "../../lib/tmdb";
import { colors, radius, space } from "../../lib/theme";
import type { Profile } from "../../lib/types";

interface FeedItem {
  id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
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
          .select(
            "id, tmdb_id, title, poster_path, rating, updated_at, user_id, profiles(username, avatar_url)"
          )
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
      <Text style={styles.title}>Feed</Text>

      <View style={styles.searchField}>
        <Ionicons name="search" size={18} color={colors.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Find friends by username..."
          placeholderTextColor={colors.sub}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
      </View>

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
              <Avatar uri={item.avatar_url} size={36} label={item.username} />
              <Text style={styles.userRowText}>{item.username}</Text>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No users found.</Text>}
        />
      ) : loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.coffee} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: space.screenX, gap: space.cardGap }}
          renderItem={({ item }) => {
            const posterUri = posterUrl(item.poster_path);
            return (
              <View style={styles.card}>
                <Pressable onPress={() => router.push(`/user/${item.user_id}`)}>
                  <Avatar
                    uri={item.profiles?.avatar_url ?? null}
                    size={42}
                    label={item.profiles?.username}
                  />
                </Pressable>

                <Pressable style={styles.cardBody} onPress={() => router.push(`/drama/${item.tmdb_id}`)}>
                  <Text style={styles.line}>
                    <Text style={styles.username} onPress={() => router.push(`/user/${item.user_id}`)}>
                      {item.profiles?.username ?? "Someone"}
                    </Text>
                    <Text style={styles.verb}> completed </Text>
                    <Text style={styles.dramaTitle}>{item.title}</Text>
                  </Text>
                  {item.rating ? (
                    <View style={styles.starsRow}>
                      {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                        <Ionicons
                          key={n}
                          name={n <= item.rating! ? "star" : "star-outline"}
                          size={12}
                          color={n <= item.rating! ? colors.amber : colors.amberEmpty}
                        />
                      ))}
                    </View>
                  ) : null}
                  <Text style={styles.timestamp}>{relativeTime(item.updated_at)}</Text>
                </Pressable>

                <Pressable onPress={() => router.push(`/drama/${item.tmdb_id}`)}>
                  {posterUri ? (
                    <Image source={{ uri: posterUri }} style={styles.poster} />
                  ) : (
                    <View style={[styles.poster, styles.posterPlaceholder]} />
                  )}
                </Pressable>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No activity yet. Search for users above and follow people to see their completed
              dramas here.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.6,
    paddingHorizontal: space.screenX,
    paddingTop: 16,
  },
  searchField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.field,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.field,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: space.screenX,
    marginTop: 16,
  },
  searchInput: { flex: 1, fontSize: 16, color: colors.ink },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: space.screenX,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  userRowText: { fontSize: 16, color: colors.ink },
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.card,
    padding: 13,
  },
  cardBody: { flex: 1, gap: 4 },
  line: { fontSize: 13.5, lineHeight: 19 },
  username: { fontWeight: "700", color: colors.ink },
  verb: { color: colors.verb },
  dramaTitle: { fontWeight: "600", color: colors.ink },
  starsRow: { flexDirection: "row", gap: 2 },
  timestamp: { fontSize: 11, color: colors.sub },
  poster: { width: 38, height: 57, borderRadius: radius.tile, backgroundColor: colors.field },
  posterPlaceholder: {},
  empty: { textAlign: "center", marginTop: 60, color: colors.sub, paddingHorizontal: 24 },
});
