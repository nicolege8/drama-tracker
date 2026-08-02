import { FlatList, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import type { DramaEntry, DramaStatus } from "../lib/types";
import { DramaCard } from "./DramaCard";
import { colors, space } from "../lib/theme";

const SECTIONS: { status: DramaStatus; title: string; dot: string }[] = [
  { status: "plan_to_watch", title: "Plan to Watch", dot: colors.caramel },
  { status: "watching", title: "Watching", dot: colors.coffee },
  { status: "completed", title: "Completed", dot: colors.sub },
];

const CARD_GAP = space.cardGap;

interface CollectionCarouselsProps {
  entries: DramaEntry[];
  editable?: boolean;
  onRemove?: (entry: DramaEntry) => void;
  emptyMessage?: string;
}

export function CollectionCarousels({
  entries,
  editable = false,
  onRemove,
  emptyMessage = "Nothing in this collection yet.",
}: CollectionCarouselsProps) {
  const { width } = useWindowDimensions();
  const cardWidth = width >= 500 ? 110 : 96;

  const sections = SECTIONS.map((s) => ({
    ...s,
    data: entries.filter((e) => e.status === s.status),
  })).filter((s) => s.data.length > 0);

  if (sections.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View>
      {sections.map((section) => (
        <View key={section.status} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.dot, { backgroundColor: section.dot }]} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>{section.data.length}</Text>
          </View>
          <FlatList
            data={section.data}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: CARD_GAP, paddingHorizontal: space.screenX }}
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
                subtitleColor={colors.amber}
                subtitleBold
                width={cardWidth}
                editable={editable}
                onRemove={onRemove ? () => onRemove(entry) : undefined}
              />
            )}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { paddingVertical: 40, alignItems: "center" },
  section: { marginBottom: space.sectionGap },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: space.screenX,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: colors.ink },
  sectionCount: { fontSize: 13, color: colors.sub },
  empty: { textAlign: "center", color: colors.sub, paddingHorizontal: 24 },
});
