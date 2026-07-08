import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { posterUrl } from "../lib/tmdb";

interface DramaCardProps {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  subtitle?: string;
}

export function DramaCard({ tmdbId, title, posterPath, subtitle }: DramaCardProps) {
  const router = useRouter();
  const uri = posterUrl(posterPath);

  return (
    <Pressable style={styles.card} onPress={() => router.push(`/drama/${tmdbId}`)}>
      {uri ? (
        <Image source={{ uri }} style={styles.poster} />
      ) : (
        <View style={[styles.poster, styles.posterPlaceholder]} />
      )}
      <Text numberOfLines={2} style={styles.title}>
        {title}
      </Text>
      {subtitle ? (
        <Text numberOfLines={1} style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: 110 },
  poster: { width: 110, height: 165, borderRadius: 8, backgroundColor: "#eee" },
  posterPlaceholder: { alignItems: "center", justifyContent: "center" },
  title: { marginTop: 6, fontSize: 13, fontWeight: "600" },
  subtitle: { fontSize: 12, color: "#777" },
});
