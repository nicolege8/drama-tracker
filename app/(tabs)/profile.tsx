import { useEffect, useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { Avatar } from "../../components/Avatar";
import { DramaCard } from "../../components/DramaCard";
import { colors, radius, space } from "../../lib/theme";
import type { DramaEntry } from "../../lib/types";

export default function ProfileScreen() {
  const { session, profile, signOut } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const recentCardWidth = (width - space.screenX * 2 - space.cardGap * 2) / 3;
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [watchedCount, setWatchedCount] = useState(0);
  const [recentlyCompleted, setRecentlyCompleted] = useState<DramaEntry[]>([]);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", session.user.id)
      .then(({ count }) => setFollowerCount(count ?? 0));

    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", session.user.id)
      .then(({ count }) => setFollowingCount(count ?? 0));

    supabase
      .from("drama_entries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id)
      .eq("status", "completed")
      .then(({ count }) => setWatchedCount(count ?? 0));

    supabase
      .from("drama_entries")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("status", "completed")
      .order("updated_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setRecentlyCompleted(data ?? []));
  }, [session]);

  const shareProfile = () => {
    if (!profile) return;
    Share.share({
      message: `Check out ${profile.username}'s profile on Drama Tracker: dramatracker://user/${profile.id}`,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Avatar uri={profile?.avatar_url ?? null} size={96} label={profile?.username} />
      <Text style={styles.username}>{profile?.username ?? "..."}</Text>
      <Text style={styles.bio}>{profile?.bio || "No bio yet."}</Text>

      <View style={styles.statsBar}>
        <View style={styles.statCol}>
          <Text style={styles.statNumber}>{watchedCount}</Text>
          <Text style={styles.statLabel}>watched</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCol}>
          <Text style={styles.statNumber}>{followerCount}</Text>
          <Text style={styles.statLabel}>followers</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCol}>
          <Text style={styles.statNumber}>{followingCount}</Text>
          <Text style={styles.statLabel}>following</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={styles.primaryButton} onPress={() => router.push("/profile/edit")}>
          <Text style={styles.primaryButtonText}>Edit Profile</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={shareProfile}>
          <Text style={styles.secondaryButtonText}>Share</Text>
        </Pressable>
      </View>

      {recentlyCompleted.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recently completed</Text>
            <Pressable onPress={() => router.push("/(tabs)/collection")}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>
          <View style={styles.recentGrid}>
            {recentlyCompleted.map((entry) => (
              <DramaCard
                key={entry.id}
                tmdbId={entry.tmdb_id}
                title={entry.title}
                posterPath={entry.poster_path}
                width={recentCardWidth}
              />
            ))}
          </View>
        </View>
      )}

      <Pressable style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { alignItems: "center", padding: space.screenX, paddingTop: 40 },
  username: { fontSize: 22, fontWeight: "700", marginTop: 14, textAlign: "center", color: colors.ink },
  bio: {
    marginTop: 6,
    fontSize: 13.5,
    color: colors.sub,
    textAlign: "center",
    lineHeight: 20,
  },
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: space.sectionGap,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.card,
    paddingVertical: 14,
  },
  statCol: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, height: "100%", backgroundColor: colors.hairline },
  statNumber: { fontSize: 20, fontWeight: "700", color: colors.ink },
  statLabel: { fontSize: 11, color: colors.sub, marginTop: 2 },
  actionsRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  primaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.coffee,
  },
  primaryButtonText: { color: colors.onCoffee, fontWeight: "700" },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.field,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  secondaryButtonText: { color: colors.coffee, fontWeight: "700" },
  recentSection: { width: "100%", marginTop: space.sectionGap + 8 },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  recentTitle: { fontSize: 17, fontWeight: "700", color: colors.ink },
  seeAll: { fontSize: 13, fontWeight: "600", color: colors.coffee },
  recentGrid: { flexDirection: "row", gap: space.cardGap },
  signOutButton: { marginTop: 32 },
  signOutText: { color: colors.sub, fontWeight: "600" },
});
