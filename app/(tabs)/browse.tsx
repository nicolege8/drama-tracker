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
import { discoverDramasByCountry, searchDramas } from "../../lib/tmdb";
import type { TmdbShowSummary } from "../../lib/types";
import { DramaCard } from "../../components/DramaCard";

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
      <TextInput
        style={styles.search}
        placeholder="Search dramas..."
        value={query}
        onChangeText={setQuery}
      />

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

      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        numColumns={3}
        columnWrapperStyle={{ gap: 12 }}
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
  container: { flex: 1, padding: 16 },
  search: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  toggleRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  toggle: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#eee",
  },
  toggleActive: { backgroundColor: "#111" },
  toggleText: { color: "#333", fontWeight: "600" },
  toggleTextActive: { color: "#fff" },
  error: { color: "crimson", marginTop: 12 },
  empty: { textAlign: "center", marginTop: 40, color: "#888" },
});
