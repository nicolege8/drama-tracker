import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { posterUrl } from "../lib/tmdb";
import { colors, radius, toneForString } from "../lib/theme";

interface DramaCardProps {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  subtitle?: string;
  subtitleColor?: string;
  subtitleBold?: boolean;
  width?: number;
  editable?: boolean;
  onRemove?: () => void;
}

export function DramaCard({
  tmdbId,
  title,
  posterPath,
  subtitle,
  subtitleColor = colors.sub,
  subtitleBold = false,
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
        <View style={posterSize}>
          {uri ? (
            <Image source={{ uri }} style={[styles.poster, posterSize]} />
          ) : (
            <View
              style={[styles.poster, posterSize, { backgroundColor: toneForString(title) }]}
            />
          )}
          <LinearGradient
            colors={["transparent", "rgba(20,12,6,0.55)"]}
            style={styles.overlay}
          />
          <Text numberOfLines={1} style={styles.overlayTitle}>
            {title}
          </Text>
        </View>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={[
              styles.subtitle,
              { color: subtitleColor, fontWeight: subtitleBold ? "600" : "400" },
            ]}
          >
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
  poster: { borderRadius: radius.poster },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "55%",
    borderBottomLeftRadius: radius.poster,
    borderBottomRightRadius: radius.poster,
  },
  overlayTitle: {
    position: "absolute",
    left: 7,
    right: 7,
    bottom: 6,
    fontSize: 10.5,
    fontWeight: "600",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
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
  subtitle: { marginTop: 6, fontSize: 11 },
});
