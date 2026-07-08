import { useCallback, useState } from "react";
import { ActivityIndicator, SectionList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import type { DramaEntry, DramaStatus } from "../../lib/types";
import { DramaCard } from "../../components/DramaCard";

const SECTIONS: { status: DramaStatus; title: string }[] = [
  { status: "watching", title: "Watching" },
  { status: "completed", title: "Completed" },
  { status: "plan_to_watch", title: "Plan to Watch" },
];

export default function Collection() {
  const { session } = useAuth();
  const [entries, setEntries] = useState<DramaEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!session) return;
    setLoading(true);
    supabase
      .from("drama_entries")
      .select("*")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        setEntries(data ?? []);
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

  const sections = SECTIONS.map((s) => ({
    title: s.title,
    data: entries.filter((e) => e.status === s.status),
  })).filter((s) => s.data.length > 0);

  return (
    <SectionList
      style={styles.container}
      sections={sections}
      keyExtractor={(item) => item.id}
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionTitle}>{section.title}</Text>
      )}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <DramaCard
            tmdbId={item.tmdb_id}
            title={item.title}
            posterPath={item.poster_path}
            subtitle={item.rating ? `★ ${item.rating}/10` : undefined}
          />
        </View>
      )}
      contentContainerStyle={{ padding: 16, gap: 8 }}
      ListEmptyComponent={
        <Text style={styles.empty}>
          Nothing in your collection yet — head to Browse to add a drama.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 16, marginBottom: 8 },
  row: { marginBottom: 8 },
  empty: { textAlign: "center", marginTop: 60, color: "#888", paddingHorizontal: 24 },
});
