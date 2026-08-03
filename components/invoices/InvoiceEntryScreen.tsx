import { useEffect, useState } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { strings } from '@/constants/strings';
import { getInvoiceStatus } from '@/db/repositories/invoice-finalization';
import type { InvoiceRecordStatus } from '@/types/invoice-finalization';
import { FinalizedInvoiceScreen } from './FinalizedInvoiceScreen';
import { InvoiceDraftScreen } from './InvoiceDraftScreen';
export function InvoiceEntryScreen({id}:{id:string}){
 const [status,setStatus]=useState<InvoiceRecordStatus|null>(null);const [loading,setLoading]=useState(true);const [error,setError]=useState(false);
 useEffect(()=>{let active=true;setLoading(true);setError(false);void getInvoiceStatus(id).then((value)=>{if(active){setStatus(value);setError(value===null)}}).catch(()=>{if(active)setError(true)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[id]);
 if(loading)return <ScreenContainer scroll={false}><LoadingState/></ScreenContainer>;
 if(error||!status)return <ScreenContainer scroll={false}><EmptyState title={strings.invoiceDrafts.detailErrorTitle} description={strings.invoiceDrafts.detailErrorDescription} icon="warning-outline"/></ScreenContainer>;
 return status==='draft'?<InvoiceDraftScreen draftId={id}/>:<FinalizedInvoiceScreen id={id}/>;
}
