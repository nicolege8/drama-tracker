import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../lib/auth";

export default function TabsLayout() {
  const { session, loading } = useAuth();

  if (!loading && !session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen
        name="browse"
        options={{
          title: "Browse",
          tabBarIcon: ({ color, size }) => <Ionicons name="search" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: "Collection",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: "Feed",
          tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
