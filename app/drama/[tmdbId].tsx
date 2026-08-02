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
import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getDramaDetails, posterUrl } from "../../lib/tmdb";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import type { DramaStatus, TmdbShowDetails } from "../../lib/types";
import { colors, radius, space, toneForString } from "../../lib/theme";

const STATUS_LABELS: Record<DramaStatus, string> = {
  plan_to_watch: "Plan to Watch",
  watching: "Watching",
  completed: "Completed",
};

const STAR_COUNT = 5;
const HERO_HEIGHT = 250;

export default function DramaDetail() {
  const { tmdbId } = useLocalSearchParams<{ tmdbId: string }>();
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  if (!authLoading && !session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.coffee} />
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
  const year = drama.first_air_date?.slice(0, 4);
  const genre = drama.genres[0]?.name;
  const hasPendingChange =
    draftStatus !== null &&
    (draftStatus !== status || (draftStatus === "completed" && draftRating !== rating));

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <View style={styles.hero}>
        {uri ? (
          <Image source={{ uri }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, { backgroundColor: toneForString(drama.name) }]} />
        )}
        <LinearGradient
          colors={["transparent", "rgba(23,15,9,0.92)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.heroScrim}
        />

        <Pressable
          style={[styles.backButton, { top: insets.top + 8 }]}
          onPress={() => router.back()}
        >
          <BlurView intensity={50} tint="light" style={styles.backButtonBlur}>
            <Ionicons name="chevron-back" size={20} color={colors.ink} />
          </BlurView>
        </Pressable>

        <View style={styles.heroContent}>
          {(genre || year) && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{[genre, year].filter(Boolean).join(" · ")}</Text>
            </View>
          )}
          <Text style={styles.heroTitle}>{drama.name}</Text>
          <Text style={styles.heroMeta}>
            {drama.number_of_episodes ?? "?"} episodes · {drama.genres.map((g) => g.name).join(", ")}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.overview}>{drama.overview}</Text>

        <Text style={styles.eyebrow}>Your status</Text>
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
            <Text style={styles.eyebrow}>Your rating</Text>
            <View style={styles.ratingRow}>
              {Array.from({ length: STAR_COUNT }, (_, i) => i + 1).map((n) => (
                <Pressable key={n} disabled={saving} onPress={() => setDraftRating(n)}>
                  <Ionicons
                    name={draftRating !== null && n <= draftRating ? "star" : "star-outline"}
                    size={30}
                    color={draftRating !== null && n <= draftRating ? colors.amber : colors.amberEmpty}
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
            <Text style={styles.eyebrow}>Cast</Text>
            <Text style={styles.overview}>
              {drama.credits.cast
                .slice(0, 8)
                .map((c) => `${c.name} as ${c.character}`)
                .join("\n")}
            </Text>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: { height: HERO_HEIGHT, backgroundColor: colors.field },
  heroImage: { ...StyleSheet.absoluteFillObject },
  heroScrim: { ...StyleSheet.absoluteFillObject },
  backButton: { position: "absolute", left: 16 },
  backButtonBlur: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  heroContent: { position: "absolute", left: 20, right: 20, bottom: 18 },
  chip: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(193,135,78,0.95)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  chipText: { color: "#3a2410", fontSize: 11, fontWeight: "700" },
  heroTitle: { fontSize: 26, fontWeight: "700", color: "#fff" },
  heroMeta: { fontSize: 13, color: "rgba(255,255,255,0.82)", marginTop: 4 },
  content: { padding: space.screenX },
  overview: { fontSize: 13.5, lineHeight: 21, color: colors.body },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.eyebrow,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: space.sectionGap,
    marginBottom: 10,
  },
  statusRow: { flexDirection: "row", gap: 8 },
  statusButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.field,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  statusButtonActive: { backgroundColor: colors.coffee, borderColor: colors.coffee },
  statusText: { color: colors.sub, fontWeight: "600" },
  statusTextActive: { color: colors.onCoffee, fontWeight: "700" },
  ratingRow: { flexDirection: "row", gap: 8 },
  confirmButton: {
    marginTop: 16,
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
    backgroundColor: colors.coffee,
  },
  confirmButtonText: { color: colors.onCoffee, fontWeight: "700" },
});
