import { StyleSheet, View } from "react-native";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SkeletonBlock, SkeletonPulse } from "@/components/ui/Skeleton";
export function DashboardSkeleton() {
  return (
    <ScreenContainer>
      <SkeletonPulse style={styles.root}>
        <View style={styles.header}>
          <SkeletonBlock width={48} height={48} />
          <View style={styles.copy}>
            <SkeletonBlock width="48%" height={24} />
            <SkeletonBlock width="76%" height={14} />
          </View>
        </View>
        <SkeletonBlock height={104} radius={20} />
        <View style={styles.row}>
          {[0, 1, 2].map((x) => (
            <SkeletonBlock key={x} height={112} style={styles.flex} />
          ))}
        </View>
        <SkeletonBlock height={48} />
        <View style={styles.grid}>
          {[0, 1, 2, 3].map((x) => (
            <SkeletonBlock key={x} height={132} style={styles.half} />
          ))}
        </View>
        <SkeletonBlock width="42%" height={22} />
        <SkeletonBlock height={154} radius={18} />
        <SkeletonBlock width="46%" height={22} />
        <SkeletonBlock height={122} radius={18} />
      </SkeletonPulse>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  root: { gap: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  copy: { flex: 1, gap: 8 },
  row: { flexDirection: "row", gap: 8 },
  flex: { flex: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  half: { flexBasis: "47%", flexGrow: 1 },
});
