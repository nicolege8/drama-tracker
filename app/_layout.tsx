import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../lib/auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="drama/[tmdbId]" options={{ headerShown: true, title: "" }} />
        <Stack.Screen name="user/[id]" options={{ headerShown: true }} />
        <Stack.Screen name="profile/edit" options={{ headerShown: true, title: "Edit Profile" }} />
      </Stack>
    </AuthProvider>
  );
}
