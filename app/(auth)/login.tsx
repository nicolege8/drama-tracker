import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../lib/auth";

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      Alert.alert("Couldn't sign in", err.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Drama Tracker</Text>
      <Text style={styles.subtitle}>Log in to your collection</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? "Signing in..." : "Sign In"}</Text>
      </Pressable>

      <Link href="/(auth)/signup" style={styles.link}>
        Don't have an account? Sign up
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 28, fontWeight: "700", textAlign: "center" },
  subtitle: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  link: { textAlign: "center", marginTop: 16, color: "#3366cc" },
});
