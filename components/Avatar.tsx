import { Image, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AvatarProps {
  uri: string | null;
  size: number;
}

export function Avatar({ uri, size }: AvatarProps) {
  const dimensions = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, dimensions]} />;
  }

  return (
    <View style={[styles.placeholder, dimensions]}>
      <Ionicons name="person" size={size * 0.55} color="#999" />
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: "#eee" },
  placeholder: {
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
});
