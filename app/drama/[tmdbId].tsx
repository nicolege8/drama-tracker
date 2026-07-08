import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { getDramaDetails, posterUrl } from "../../lib/tmdb";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import type { DramaStatus, TmdbShowDetails } from "../../lib/types";

const STATUS_LABELS: Record<DramaStatus, string> = {
  watching: "Watching",
  completed: "Completed",
  plan_to_watch: "Plan to Watch",
};

export default function DramaDetail() {
  const { tmdbId } = useLocalSearchParams<{ tmdbId: string }>();
  const { session } = useAuth();
  const [drama, setDrama] = useState<TmdbShowDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<DramaStatus | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = Number(tmdbId);
    getDramaDetails(id)
      .then(setDrama)
      .catch((err) => Alert.alert("Failed to load drama", err.message))
      .finally(() => setLoading(false));

    if (session) {
      supabase
        .from("drama_entries")
        .select("status, rating")
        .eq("user_id", session.user.id)
        .eq("tmdb_id", id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setStatus(data.status);
            setRating(data.rating);
          }
        });
    }
  }, [tmdbId, session]);

  const saveEntry = async (nextStatus: DramaStatus, nextRating: number | null) => {
    if (!session || !drama) return;
    setSaving(true);
    const { error } = await supabase.from("drama_entries").upsert(
      {
        user_id: session.user.id,
        tmdb_id: drama.id,
        title: drama.name,
        poster_path: drama.poster_path,
        status: nextStatus,
        rating: nextRating,
      },
      { onConflict: "user_id,tmdb_id" }
    );
    setSaving(false);
    if (error) {
      Alert.alert("Couldn't save", error.message);
      return;
    }
    setStatus(nextStatus);
    setRating(nextRating);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!drama) {
    return (
      <View style={styles.centered}>
        <Text>Couldn't load this drama.</Text>
      </View>
    );
  }

  const uri = posterUrl(drama.poster_path);

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: drama.name }} />
      <View style={styles.header}>
        {uri ? <Image source={{ uri }} style={styles.poster} /> : null}
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{drama.name}</Text>
          <Text style={styles.meta}>
            {drama.first_air_date?.slice(0, 4)} · {drama.number_of_episodes ?? "?"} episodes
          </Text>
          <Text style={styles.meta}>{drama.genres.map((g) => g.name).join(", ")}</Text>
        </View>
      </View>

      <Text style={styles.overview}>{drama.overview}</Text>

      <Text style={styles.sectionTitle}>Your status</Text>
      <View style={styles.statusRow}>
        {(Object.keys(STATUS_LABELS) as DramaStatus[]).map((s) => (
          <Pressable
            key={s}
            style={[styles.statusButton, status === s && styles.statusButtonActive]}
            disabled={saving}
            onPress={() => saveEntry(s, rating)}
          >
            <Text style={[styles.statusText, status === s && styles.statusTextActive]}>
              {STATUS_LABELS[s]}
            </Text>
          </Pressable>
        ))}
      </View>

      {status && (
        <>
          <Text style={styles.sectionTitle}>Your rating</Text>
          <View style={styles.ratingRow}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <Pressable key={n} disabled={saving} onPress={() => saveEntry(status, n)}>
                <Text style={[styles.ratingNumber, rating === n && styles.ratingNumberActive]}>
                  {n}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {drama.credits?.cast && drama.credits.cast.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Cast</Text>
          <Text style={styles.overview}>
            {drama.credits.cast
              .slice(0, 8)
              .map((c) => `${c.name} as ${c.character}`)
              .join("\n")}
          </Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", gap: 16 },
  poster: { width: 120, height: 180, borderRadius: 8, backgroundColor: "#eee" },
  headerInfo: { flex: 1, justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "700" },
  meta: { color: "#666", marginTop: 4 },
  overview: { marginTop: 16, lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 24, marginBottom: 8 },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#eee",
  },
  statusButtonActive: { backgroundColor: "#111" },
  statusText: { color: "#333", fontWeight: "600" },
  statusTextActive: { color: "#fff" },
  ratingRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  ratingNumber: {
    fontSize: 16,
    width: 28,
    height: 28,
    textAlign: "center",
    lineHeight: 28,
    borderRadius: 14,
    backgroundColor: "#eee",
  },
  ratingNumberActive: { backgroundColor: "#111", color: "#fff" },
});
