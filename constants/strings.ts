export const strings = {
  appName: 'InvoiceFine',
  common: {
    loading: 'Loading',
    notAvailable: '—',
    retry: 'Try again',
  },
  tabs: {
    dashboard: 'Dashboard',
    invoices: 'Invoices',
    customers: 'Customers',
    catalog: 'Catalog',
    more: 'More',
  },
  dashboard: {
    eyebrow: 'BUSINESS OVERVIEW',
    title: 'Dashboard',
    description: 'Your business summary will appear here as you begin using InvoiceFine.',
    summaryTitle: 'Summary',
    recentTitle: 'Recent activity',
    metrics: {
      sales: "Today's sales",
      received: 'Payments received',
      receivables: 'Pending receivables',
      stock: 'Low-stock items',
    },
    metricPlaceholder: 'Available after setup',
    emptyTitle: 'No activity yet',
    emptyDescription: 'Recent invoices and payments will appear here in a future milestone.',
  },
  placeholders: {
    invoices: {
      title: 'No invoices yet',
      description: 'Invoice management will be added in a future milestone.',
    },
    customers: {
      title: 'No customers yet',
      description: 'Customer management will be added in a future milestone.',
    },
    catalog: {
      title: 'Catalog is empty',
      description: 'Products and services will be added in a future milestone.',
    },
    more: {
      title: 'More tools',
      description: 'Settings and additional tools will be added in future milestones.',
    },
  },
} as const;
