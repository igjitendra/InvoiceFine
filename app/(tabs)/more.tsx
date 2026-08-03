import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { strings } from '@/constants/strings';
import { theme } from '@/constants/theme';
export default function MoreScreen(){const router=useRouter();return <ScreenContainer scroll={false}><Text style={styles.title}>{strings.tabs.more}</Text><Pressable accessibilityRole="button" onPress={()=>router.push('/onboarding')} style={styles.row}><Text style={styles.label}>{strings.pdf.profileTitle}</Text></Pressable><Pressable accessibilityRole="button" onPress={()=>router.push('/expenses')} style={styles.row}><Text style={styles.label}>{strings.expenses.title}</Text></Pressable><Pressable accessibilityRole="button" onPress={()=>router.push('/reports/profit')} style={styles.row}><Text style={styles.label}>{strings.expenses.report}</Text></Pressable></ScreenContainer>}
const styles=StyleSheet.create({title:{color:theme.colors.textPrimary,...theme.typography.screenTitle},row:{minHeight:theme.layout.minimumTouchTarget,justifyContent:'center',padding:theme.spacing[4],backgroundColor:theme.colors.surface,borderRadius:theme.radii.card},label:{color:theme.colors.textPrimary,...theme.typography.body}});
