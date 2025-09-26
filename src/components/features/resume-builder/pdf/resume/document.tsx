import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import type { Resume } from '@/lib/constants';
import { Education } from './education';
import { Experience } from './experience';
import { Heading } from './heading';
import { Project } from './project';
import { Section } from './section';
import { Skill } from './skill';
import { Watermark } from './watermark';

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
};

export const ResumesDocument: React.FC<ResumesDocumentProps> = ({ data }) => {
  return (
    <Document
      author='Kelvin Mai'
      title={`${data.basics.name} - ${data.basics.label}`}
      producer='Kelvin Mai'
      subject={`${data.basics.name} Resume`}
    >
      <Page size='A4' style={styles.page}>
        <Watermark />
        <Heading info={data.basics} />
        <View style={styles.twoColumn}>
          <View style={styles.left}>
            <Section title='About'>
              <Text>{data.basics.summary}</Text>
            </Section>
            <Section title='Work Experience'>
              {data.work.map((w) => (
                <Experience key={w.name} {...w} />
              ))}
            </Section>
            <Section title='Projects'>
              {data.projects.map((p) => (
                <Project key={p.name} {...p} />
              ))}
            </Section>
          </View>
          <View style={styles.right}>
            <Section title='Education'>
              {data.education.map((e) => (
                <Education key={e.institution} {...e} />
              ))}
            </Section>
            <Section title='Skills'>
              {data.skills.map((s) => (
                <Skill key={s.name} {...s} />
              ))}
            </Section>
          </View>
        </View>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};
