import { Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";

interface AvatarProps {
  uri: string | null;
  size: number;
  label?: string;
}

export function Avatar({ uri, size, label }: AvatarProps) {
  const dimensions = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, dimensions]} />;
  }

  const initial = label?.trim()?.[0]?.toUpperCase();

  return (
    <LinearGradient
      colors={[colors.coffee, colors.caramel]}
      style={[styles.gradient, dimensions]}
    >
      {initial ? (
        <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
      ) : (
        <Ionicons name="person" size={size * 0.5} color={colors.onCoffee} />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.field },
  gradient: { alignItems: "center", justifyContent: "center" },
  initial: { color: colors.onCoffee, fontWeight: "700" },
});
