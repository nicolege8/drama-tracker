import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Tabs, useFocusEffect } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import type { DramaEntry } from "../../lib/types";
import { CollectionCarousels } from "../../components/CollectionCarousels";
import { colors, space } from "../../lib/theme";

export default function Collection() {
  const { session } = useAuth();
  const [entries, setEntries] = useState<DramaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

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
          <ActivityIndicator color={colors.coffee} />
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 16 }}>
          <View style={styles.header}>
            <Text style={styles.title}>Collection</Text>
            <Text style={styles.subtitle}>
              {entries.length} {entries.length === 1 ? "drama" : "dramas"} tracked
            </Text>
          </View>

          <CollectionCarousels
            entries={entries}
            editable={editMode}
            onRemove={removeEntry}
            emptyMessage="Nothing in your collection yet — head to Browse to add a drama."
          />
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingHorizontal: space.screenX, paddingTop: 16, marginBottom: space.sectionGap },
  title: { fontSize: 30, fontWeight: "700", color: colors.ink, letterSpacing: -0.6 },
  subtitle: { fontSize: 14, color: colors.sub, marginTop: 4 },
  editToggle: { marginRight: 16, paddingVertical: 4, paddingHorizontal: 4 },
  editToggleText: { fontSize: 16, fontWeight: "600", color: colors.coffee },
});
