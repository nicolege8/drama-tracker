import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { posterUrl } from "../lib/tmdb";

interface DramaCardProps {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  subtitle?: string;
  width?: number;
  editable?: boolean;
  onRemove?: () => void;
}

export function DramaCard({
  tmdbId,
  title,
  posterPath,
  subtitle,
  width = 110,
  editable = false,
  onRemove,
}: DramaCardProps) {
  const router = useRouter();
  const uri = posterUrl(posterPath);
  const posterSize = { width, height: width * 1.5 };

  return (
    <View style={[styles.card, { width }]}>
      <Pressable disabled={editable} onPress={() => router.push(`/drama/${tmdbId}`)}>
        {uri ? (
          <Image source={{ uri }} style={[styles.poster, posterSize]} />
        ) : (
          <View style={[styles.poster, styles.posterPlaceholder, posterSize]} />
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
      {editable && (
        <Pressable style={styles.removeBadge} onPress={onRemove} hitSlop={8}>
          <Ionicons name="remove" size={16} color="#fff" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {},
  poster: { borderRadius: 8, backgroundColor: "#eee" },
  posterPlaceholder: { alignItems: "center", justifyContent: "center" },
  removeBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e33",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  title: { marginTop: 6, fontSize: 13, fontWeight: "600" },
  subtitle: { fontSize: 12, color: "#777" },
});
