import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import type { Resume } from '@/lib/constants';


const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingHorizontal: 50,
    fontFamily: 'Ubuntu',
    fontSize: 10,
    paddingBottom: 36,
  },
  twoColumn: {
    flexDirection: 'row',
  },
  left: {
    flexGrow: 1,
    marginRight: 16,
    width: '55%',
  },
  right: {
    flexGrow: 1,
    width: '40%',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 12,
    bottom: 24,
    left: 0,
    right: 35,
    textAlign: 'right',
    color: '#64748b',
  },
});

type ResumesDocumentProps = {
    data: Resume;
}



export const ResumesDocument = ({ data }: ResumesDocumentProps) => {
  return (
    <Document
      author='Kelvin Mai'
    
    >
      <Page size='A4'>
    
       <View style={styles.page}>
          <Text>hello world</Text>
       </View>
          
      
        </Page>
        </Document>
  );
};
