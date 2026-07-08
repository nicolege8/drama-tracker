import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import type { Profile } from "../../lib/types";

export default function ProfileScreen() {
  const { session, profile, signOut } = useAuth();
  const router = useRouter();
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);

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
      <Text style={styles.username}>{profile?.username ?? "..."}</Text>
      <View style={styles.statsRow}>
        <Text style={styles.stat}>{followerCount} followers</Text>
        <Text style={styles.stat}>{followingCount} following</Text>
      </View>

      <Pressable style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Find friends</Text>
      <TextInput
        style={styles.search}
        placeholder="Search by username..."
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.userRow}
            onPress={() => router.push(`/user/${item.id}`)}
          >
            <Text style={styles.userRowText}>{item.username}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  username: { fontSize: 24, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 16, marginTop: 8 },
  stat: { color: "#666" },
  signOutButton: {
    marginTop: 16,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#eee",
  },
  signOutText: { fontWeight: "600" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 28, marginBottom: 8 },
  search: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  userRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  userRowText: { fontSize: 16 },
});
