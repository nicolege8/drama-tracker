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
import { Ionicons } from "@expo/vector-icons";
import { getDramaDetails, posterUrl } from "../../lib/tmdb";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import type { DramaStatus, TmdbShowDetails } from "../../lib/types";

const STATUS_LABELS: Record<DramaStatus, string> = {
  plan_to_watch: "Plan to Watch",
  watching: "Watching",
  completed: "Completed",
};

const STAR_COUNT = 5;

export default function DramaDetail() {
  const { tmdbId } = useLocalSearchParams<{ tmdbId: string }>();
  const { session } = useAuth();
  const [drama, setDrama] = useState<TmdbShowDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<DramaStatus | null>(null);
  const [draftStatus, setDraftStatus] = useState<DramaStatus | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [draftRating, setDraftRating] = useState<number | null>(null);
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
            setDraftStatus(data.status);
            setRating(data.rating);
            setDraftRating(data.rating);
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
    setDraftStatus(nextStatus);
    setRating(nextRating);
    setDraftRating(nextRating);
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
  const hasPendingChange =
    draftStatus !== null &&
    (draftStatus !== status || (draftStatus === "completed" && draftRating !== rating));

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
            style={[styles.statusButton, draftStatus === s && styles.statusButtonActive]}
            disabled={saving}
            onPress={() => setDraftStatus(s)}
          >
            <Text style={[styles.statusText, draftStatus === s && styles.statusTextActive]}>
              {STATUS_LABELS[s]}
            </Text>
          </Pressable>
        ))}
      </View>

      {draftStatus === "completed" && (
        <>
          <Text style={styles.sectionTitle}>Your rating</Text>
          <View style={styles.ratingRow}>
            {Array.from({ length: STAR_COUNT }, (_, i) => i + 1).map((n) => (
              <Pressable key={n} disabled={saving} onPress={() => setDraftRating(n)}>
                <Ionicons
                  name={draftRating !== null && n <= draftRating ? "star" : "star-outline"}
                  size={32}
                  color="#f5a623"
                />
              </Pressable>
            ))}
          </View>
        </>
      )}

      {hasPendingChange && (
        <Pressable
          style={styles.confirmButton}
          disabled={saving}
          onPress={() =>
            saveEntry(draftStatus!, draftStatus === "completed" ? draftRating : rating)
          }
        >
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </Pressable>
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
  ratingRow: { flexDirection: "row", gap: 8 },
  confirmButton: {
    marginTop: 16,
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#111",
  },
  confirmButtonText: { color: "#fff", fontWeight: "700" },
});
