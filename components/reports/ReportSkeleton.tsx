import { StyleSheet, View } from "react-native";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SkeletonBlock, SkeletonPulse } from "@/components/ui/Skeleton";
export function ReportSkeleton() {
  return (
    <ScreenContainer>
      <SkeletonPulse style={styles.root}>
        <SkeletonBlock width="58%" height={34} />
        <SkeletonBlock width="76%" height={18} />
        <SkeletonBlock height={196} radius={20} />
        <View style={styles.row}>
          <SkeletonBlock height={104} style={styles.flex} />
          <SkeletonBlock height={104} style={styles.flex} />
        </View>
        <SkeletonBlock height={286} radius={20} />
        <SkeletonBlock height={286} radius={20} />
      </SkeletonPulse>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  root: { gap: 16 },
  row: { flexDirection: "row", gap: 8 },
  flex: { flex: 1 },
});
