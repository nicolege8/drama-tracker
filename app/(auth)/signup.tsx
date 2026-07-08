import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../lib/auth";

export default function Signup() {
  const { signUp } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await signUp(email, password, username);
      Alert.alert(
        "Check your email",
        "Confirm your address to finish creating your account, then log in."
      );
    } catch (err: any) {
      Alert.alert("Couldn't sign up", err.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
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
        <Text style={styles.buttonText}>{submitting ? "Creating..." : "Sign Up"}</Text>
      </Pressable>

      <Link href="/(auth)/login" style={styles.link}>
        Already have an account? Log in
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 12 },
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
