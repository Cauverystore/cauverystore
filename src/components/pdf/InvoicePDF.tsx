// src/components/pdf/InvoicePDF.tsx
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: 'Helvetica' },
  section: { marginBottom: 10 },
  logo: { width: 100, marginBottom: 20 },
  heading: { fontSize: 16, marginBottom: 10, fontWeight: 'bold' },
  table: { marginTop: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  bold: { fontWeight: 'bold' }
});

export default function InvoicePDF({ order }: any) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src="https://www.cauverystore.in/logo.png" style={styles.logo} />
        <Text style={styles.heading}>Invoice - Order #{order.id}</Text>
        <View style={styles.section}>
          <Text><Text style={styles.bold}>Date:</Text> {new Date(order.created_at).toLocaleDateString()}</Text>
          <Text><Text style={styles.bold}>Status:</Text> {order.status}</Text>
          <Text><Text style={styles.bold}>Total:</Text> ₹{order.total?.toFixed(2)}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.bold}>Delivery Address:</Text>
          <Text>{order.address || 'N/A'}</Text>
        </View>
        {Array.isArray(order.items) && (
          <View style={styles.table}>
            <Text style={styles.bold}>Items:</Text>
            {order.items.map((item: any, index: number) => (
              <View key={index} style={styles.row}>
                <Text>{item.name} × {item.quantity}</Text>
                <Text>₹{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
