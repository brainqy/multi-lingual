

import { Document, Page, Text, View, StyleSheet, PDFViewer } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#E4E4E4",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

const MyDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>PDF Render Test: Section #1</Text>
      </View>
      <View style={styles.section}>
        <Text>PDF Render Test: Section #2</Text>
      </View>
    </Page>
  </Document>
);

export default function PdfDownloadPage() {
  return (
    <div>
      <h1>PDF Download Page</h1>
      <PDFViewer style={{ width: "100%", height: "90vh" }}>
        <MyDocument />
      </PDFViewer>
    </div>
  );
}