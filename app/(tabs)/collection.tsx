import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Tabs, useFocusEffect } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import type { DramaEntry, DramaStatus } from "../../lib/types";
import { DramaCard } from "../../components/DramaCard";

const SECTIONS: { status: DramaStatus; title: string }[] = [
  { status: "plan_to_watch", title: "Plan to Watch" },
  { status: "watching", title: "Watching" },
  { status: "completed", title: "Completed" },
];

const PAGE_PADDING = 16;
const CARD_GAP = 12;

export default function Collection() {
  const { session } = useAuth();
  const { width } = useWindowDimensions();
  const [entries, setEntries] = useState<DramaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const cardsPerScreen = width >= 500 ? 4.5 : 3.3;
  const cardWidth = (width - PAGE_PADDING * 2 - CARD_GAP * (cardsPerScreen - 1)) / cardsPerScreen;

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

  const removeEntry = (entry: DramaEntry) => {
    Alert.alert("Remove from collection?", `"${entry.title}" will be removed.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("drama_entries").delete().eq("id", entry.id);
          if (error) {
            Alert.alert("Couldn't remove", error.message);
            return;
          }
          setEntries((prev) => prev.filter((e) => e.id !== entry.id));
        },
      },
    ]);
  };

  const sections = SECTIONS.map((s) => ({
    ...s,
    data: entries.filter((e) => e.status === s.status),
  })).filter((s) => s.data.length > 0);

  return (
    <>
      <Tabs.Screen
        options={{
          headerRight: () => (
            <Pressable style={styles.editToggle} onPress={() => setEditMode((e) => !e)}>
              <Text style={styles.editToggleText}>{editMode ? "Done" : "Edit"}</Text>
            </Pressable>
          ),
        }}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.empty}>
            Nothing in your collection yet — head to Browse to add a drama.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingVertical: 16 }}>
          {sections.map((section) => (
            <View key={section.status} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <FlatList
                data={section.data}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ gap: CARD_GAP, paddingHorizontal: PAGE_PADDING }}
                renderItem={({ item: entry }) => (
                  <DramaCard
                    tmdbId={entry.tmdb_id}
                    title={entry.title}
                    posterPath={entry.poster_path}
                    subtitle={
                      section.status === "completed" && entry.rating
                        ? `★ ${entry.rating}/5`
                        : undefined
                    }
                    width={cardWidth}
                    editable={editMode}
                    onRemove={() => removeEntry(entry)}
                  />
                )}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    paddingHorizontal: PAGE_PADDING,
  },
  empty: { textAlign: "center", color: "#888", paddingHorizontal: 24 },
  editToggle: { marginRight: 16, paddingVertical: 4, paddingHorizontal: 4 },
  editToggleText: { fontSize: 16, fontWeight: "600", color: "#007aff" },
});
