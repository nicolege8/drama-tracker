import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { discoverDramasByCountry, searchDramas } from "../../lib/tmdb";
import type { TmdbShowSummary } from "../../lib/types";
import { DramaCard } from "../../components/DramaCard";
import { colors, radius, space } from "../../lib/theme";

type Country = "KR" | "CN";

export default function Browse() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<Country>("KR");
  const [results, setResults] = useState<TmdbShowSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const run = query.trim()
      ? searchDramas(query)
      : discoverDramasByCountry(country);

    run
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Failed to load dramas");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query, country]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Discover</Text>
      <Text style={styles.subtitle}>Fresh brews from Seoul & Hengdian</Text>

      <View style={styles.searchField}>
        <Ionicons name="search" size={18} color={colors.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search dramas..."
          placeholderTextColor={colors.sub}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {!query.trim() && (
        <View style={styles.toggleRow}>
          {(["KR", "CN"] as Country[]).map((c) => (
            <Pressable
              key={c}
              style={[styles.toggle, country === c && styles.toggleActive]}
              onPress={() => setCountry(c)}
            >
              <Text style={[styles.toggleText, country === c && styles.toggleTextActive]}>
                {c === "KR" ? "K-Dramas" : "C-Dramas"}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {loading && <ActivityIndicator style={{ marginTop: 20 }} color={colors.coffee} />}
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        numColumns={3}
        columnWrapperStyle={{ gap: space.cardGap }}
        contentContainerStyle={{ gap: 16, paddingVertical: 16 }}
        renderItem={({ item }) => (
          <DramaCard
            tmdbId={item.id}
            title={item.name}
            posterPath={item.poster_path}
            subtitle={item.first_air_date?.slice(0, 4)}
          />
        )}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>No dramas found.</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: space.screenX, paddingTop: 16, backgroundColor: colors.surface },
  title: { fontSize: 30, fontWeight: "700", color: colors.ink, letterSpacing: -0.6 },
  subtitle: { fontSize: 14, color: colors.sub, marginTop: 4 },
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
    marginTop: 16,
  },
  searchInput: { flex: 1, fontSize: 16, color: colors.ink },
  toggleRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  toggle: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.field,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  toggleActive: { backgroundColor: colors.coffee, borderColor: colors.coffee },
  toggleText: { color: colors.sub, fontWeight: "600" },
  toggleTextActive: { color: colors.onCoffee },
  error: { color: "crimson", marginTop: 12 },
  empty: { textAlign: "center", marginTop: 40, color: colors.sub },
});
