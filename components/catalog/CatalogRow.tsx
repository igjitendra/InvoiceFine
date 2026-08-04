import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '@/components/ui/PressableScale';
import { useAppPalette } from '@/hooks/useAppPalette';
import { strings } from '@/constants/strings';
import { theme } from '@/constants/theme';
import { formatPaise } from '@/lib/currency';
import { scaledToInput } from '@/lib/quantity';
import type { CatalogItem } from '@/types/catalog';

export function CatalogRow({ item, onPress }: { item: CatalogItem; onPress: () => void }) {
  const palette = useAppPalette();
  const isProduct = item.type === 'product';
  const outOfStock = isProduct && item.currentStockScaled <= 0;
  const lowStock = isProduct && item.currentStockScaled <= item.lowStockThresholdScaled;
  const stockLabel = outOfStock ? strings.ux.outOfStock : lowStock ? strings.ux.lowStockLabel : strings.ux.inStock;
  return (
    <PressableScale accessibilityRole="button" accessibilityLabel={`${item.name}, ${formatPaise(item.sellingPricePaise)}`} onPress={onPress} style={[styles.card,{backgroundColor:palette.surface,borderColor:palette.border}]}>
      <View style={[styles.icon, isProduct ? styles.productIcon : styles.serviceIcon]}><Ionicons name={isProduct ? 'cube' : 'construct'} size={24} color={isProduct ? theme.colors.primary : '#7E22CE'} /></View>
      <View style={styles.copy}>
        <View style={styles.titleRow}><Text numberOfLines={1} style={styles.name}>{item.name}</Text><Text style={styles.price}>{formatPaise(item.sellingPricePaise)}</Text></View>
        <Text numberOfLines={1} style={styles.meta}>{item.brand ? `${item.brand} · ` : ''}{item.sku ? `${item.sku} · ` : ''}{item.categoryName ?? strings.catalog.types[item.type]}</Text>
        <View style={styles.footer}>
          {isProduct ? <View style={[styles.stockBadge, lowStock ? styles.stockWarning : styles.stockPositive]}><View style={[styles.dot, lowStock ? styles.dotWarning : styles.dotPositive]} /><Text style={[styles.stockStatus, lowStock ? styles.warningText : styles.positiveText]}>{stockLabel}</Text><Text style={styles.stockValue}> · {scaledToInput(item.currentStockScaled)} {item.unitName ?? ''}</Text></View> : <View style={styles.serviceBadge}><Ionicons name="flash-outline" size={14} color="#7E22CE"/><Text style={styles.serviceText}>{strings.catalog.types.service}</Text></View>}
          <View style={styles.edit}><Text style={styles.editText}>{strings.ux.edit}</Text><Ionicons name="chevron-forward" size={16} color={theme.colors.primary}/></View>
        </View>
      </View>
    </PressableScale>
  );
}
const styles=StyleSheet.create({card:{minHeight:126,marginHorizontal:theme.layout.screenHorizontalPadding,marginBottom:theme.spacing[3],padding:theme.spacing[4],flexDirection:'row',alignItems:'flex-start',gap:theme.spacing[3],backgroundColor:theme.colors.surface,borderWidth:1,borderColor:theme.colors.border,borderRadius:18},pressed:{backgroundColor:theme.colors.primarySoft,borderColor:theme.colors.primary},icon:{width:52,height:52,borderRadius:16,alignItems:'center',justifyContent:'center'},productIcon:{backgroundColor:theme.colors.primarySoft},serviceIcon:{backgroundColor:'#F3E8FF'},copy:{flex:1,gap:theme.spacing[2]},titleRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',gap:theme.spacing[3]},name:{flex:1,color:theme.colors.textPrimary,...theme.typography.sectionTitle},price:{color:theme.colors.textPrimary,...theme.typography.sectionTitle},meta:{color:theme.colors.textSecondary,...theme.typography.secondary},footer:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:theme.spacing[2]},stockBadge:{minHeight:28,flexShrink:1,paddingHorizontal:theme.spacing[2],flexDirection:'row',alignItems:'center',borderRadius:99},stockPositive:{backgroundColor:'#DCFCE7'},stockWarning:{backgroundColor:'#FEF3C7'},dot:{width:7,height:7,borderRadius:99,marginRight:theme.spacing[1]},dotPositive:{backgroundColor:theme.colors.positive},dotWarning:{backgroundColor:theme.colors.warning},stockStatus:{...theme.typography.caption,fontWeight:'700'},positiveText:{color:theme.colors.positive},warningText:{color:theme.colors.warning},stockValue:{flexShrink:1,color:theme.colors.textSecondary,...theme.typography.caption},serviceBadge:{minHeight:28,paddingHorizontal:theme.spacing[2],flexDirection:'row',alignItems:'center',gap:theme.spacing[1],backgroundColor:'#F3E8FF',borderRadius:99},serviceText:{color:'#7E22CE',...theme.typography.caption,fontWeight:'700'},edit:{minHeight:32,flexDirection:'row',alignItems:'center'},editText:{color:theme.colors.primary,...theme.typography.label}});
