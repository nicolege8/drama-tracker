import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../lib/auth";
import { PASSWORD_REQUIREMENTS, isPasswordValid } from "../../lib/validation";

export default function Signup() {
  const { signUp } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const passwordTouched = password.length > 0;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async () => {
    if (!username.trim() || !email.trim()) {
      Alert.alert("Missing info", "Enter a username and email.");
      return;
    }
    if (!isPasswordValid(password)) {
      Alert.alert("Password too weak", "Your password doesn't meet all the requirements below.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords don't match", "Make sure both password fields are identical.");
      return;
    }

    setSubmitting(true);
    try {
      await signUp(email.trim(), password, username.trim());
      Alert.alert(
        "Check your email",
        "Confirm your address to finish creating your account, then log in."
      );
    } catch (err: any) {
      const message: string = err.message ?? "Something went wrong";
      if (/already registered|already exists|already in use/i.test(message)) {
        Alert.alert("Email already in use", "An account with this email already exists. Try logging in instead.");
      } else {
        Alert.alert("Couldn't sign up", message);
      }
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
      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {passwordTouched && (
        <View style={styles.requirements}>
          {PASSWORD_REQUIREMENTS.map((req) => {
            const met = req.test(password);
            return (
              <Text key={req.label} style={[styles.requirement, met && styles.requirementMet]}>
                {met ? "✓" : "•"} {req.label}
              </Text>
            );
          })}
          {confirmPassword.length > 0 && (
            <Text style={[styles.requirement, passwordsMatch && styles.requirementMet]}>
              {passwordsMatch ? "✓" : "•"} Passwords match
            </Text>
          )}
        </View>
      )}

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
  requirements: { marginTop: -4, gap: 2 },
  requirement: { fontSize: 13, color: "#999" },
  requirementMet: { color: "#2a8" },
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
