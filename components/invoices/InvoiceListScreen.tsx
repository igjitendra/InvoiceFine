import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { routes } from '@/constants/routes';
import { strings } from '@/constants/strings';
import { theme } from '@/constants/theme';
import { listInvoiceDrafts } from '@/db/repositories/invoice-drafts';
import { formatPaise } from '@/lib/currency';
import type { InvoiceDraftListItem } from '@/types/invoice-draft';

export function InvoiceListScreen() {
  const router=useRouter(); const [drafts,setDrafts]=useState<InvoiceDraftListItem[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(false); const [attempt,setAttempt]=useState(0);
  useFocusEffect(useCallback(()=>{ let active=true; setLoading(true); setError(false); void listInvoiceDrafts().then((rows)=>{if(active)setDrafts(rows)}).catch(()=>{if(active)setError(true)}).finally(()=>{if(active)setLoading(false)}); return()=>{active=false}; },[attempt]));
  return <SafeAreaView style={styles.safe} edges={['top','left','right']}>
    <View style={styles.header}><Text style={styles.title}>{strings.invoiceDrafts.title}</Text><Pressable accessibilityRole="button" accessibilityLabel={strings.invoiceDrafts.add} onPress={()=>router.push(routes.invoiceNew)} style={styles.add}><Ionicons name="add" size={24} color={theme.colors.textOnPrimary}/></Pressable></View>
    {loading?<LoadingState/>:error?<EmptyState title={strings.invoiceDrafts.loadErrorTitle} description={strings.invoiceDrafts.loadErrorDescription} icon="warning-outline" actionLabel={strings.common.retry} onAction={()=>setAttempt((v)=>v+1)}/>:<FlatList data={drafts} keyExtractor={(item)=>item.id} contentContainerStyle={drafts.length===0?styles.empty:styles.list} ListEmptyComponent={<EmptyState title={strings.invoiceDrafts.emptyTitle} description={strings.invoiceDrafts.emptyDescription} icon="document-text-outline"/>} renderItem={({item})=><Pressable accessibilityRole="button" onPress={()=>router.push({pathname:'/invoice/[id]',params:{id:item.id}})} style={({pressed})=>[styles.row,pressed&&styles.pressed]}><View style={styles.copy}><Text style={styles.name}>{item.status === 'draft' ? (item.customerName ?? strings.invoiceDrafts.noCustomer) : item.invoiceNumber}</Text><Text style={styles.meta}>{strings.finalization.status[item.status]} · {item.customerName ?? strings.invoiceDrafts.noCustomer} · {item.invoiceDate}</Text></View><Text style={styles.amount}>{formatPaise(item.totalPaise)}</Text><Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary}/></Pressable>}/>} 
  </SafeAreaView>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:theme.colors.background},header:{minHeight:theme.layout.headerHeight,flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:theme.layout.screenHorizontalPadding},title:{color:theme.colors.textPrimary,...theme.typography.screenTitle},add:{width:theme.layout.minimumTouchTarget,height:theme.layout.minimumTouchTarget,alignItems:'center',justifyContent:'center',backgroundColor:theme.colors.primary,borderRadius:theme.radii.small},list:{paddingBottom:theme.layout.tabBarHeight+theme.spacing[5]},empty:{flexGrow:1,justifyContent:'center',paddingBottom:theme.layout.tabBarHeight},row:{minHeight:76,flexDirection:'row',alignItems:'center',gap:theme.spacing[3],paddingHorizontal:theme.spacing[4],paddingVertical:theme.spacing[3],backgroundColor:theme.colors.surface,borderBottomColor:theme.colors.border,borderBottomWidth:theme.layout.borderWidth},pressed:{backgroundColor:theme.colors.primarySoft},copy:{flex:1,gap:theme.spacing[1]},name:{color:theme.colors.textPrimary,...theme.typography.body},meta:{color:theme.colors.textSecondary,...theme.typography.secondary},amount:{color:theme.colors.textPrimary,...theme.typography.body}});
