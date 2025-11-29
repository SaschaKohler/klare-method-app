// src/components/modules/ModuleContent.tsx
import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, Divider, useTheme } from "react-native-paper";
import Markdown from "react-native-markdown-display";
import { ContentSection } from "../../lib/contentService";

interface ModuleContentProps {
  title: string;
  content: any;
  sections?: ContentSection[];
}

const ModuleContent: React.FC<ModuleContentProps> = ({
  title,
  content,
  sections,
}) => {
  const theme = useTheme();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>

        {content.intro_text && (
          <Text style={styles.introText}>{content.intro_text}</Text>
        )}

        {content.key_points && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Wichtige Punkte</Text>
              {content.key_points.map((point: string, index: number) => (
                <View key={index} style={styles.bulletPoint}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{point}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {content.key_concepts && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Schlüsselkonzepte</Text>
              {content.key_concepts.map((concept: string, index: number) => (
                <View key={index} style={styles.bulletPoint}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{concept}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {sections && sections.length > 0 && (
          <View style={styles.sectionsContainer}>
            {sections.map((section, index) => (
              <View key={section.id} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Markdown
                  style={{
                    body: {
                      color: theme.colors.onBackground,
                      fontSize: 16,
                      lineHeight: 24,
                    },
                    heading1: {
                      fontSize: 24,
                      fontWeight: "bold",
                      color: theme.colors.primary,
                      marginTop: 16,
                      marginBottom: 8,
                    },
                    heading2: {
                      fontSize: 20,
                      fontWeight: "bold",
                      color: theme.colors.primary,
                      marginTop: 16,
                      marginBottom: 8,
                    },
                    heading3: {
                      fontSize: 18,
                      fontWeight: "bold",
                      color: theme.colors.onBackground,
                      marginTop: 12,
                      marginBottom: 6,
                    },
                    paragraph: { marginBottom: 16 },
                    bullet_list: { marginVertical: 8 },
                    bullet_list_item: { marginLeft: 8, flexDirection: "row" },
                    bullet_list_icon: { marginRight: 8, fontWeight: "bold" },
                    ordered_list: { marginVertical: 8 },
                    ordered_list_item: { marginLeft: 8, flexDirection: "row" },
                    ordered_list_icon: { marginRight: 8, fontWeight: "bold" },
                    code_block: {
                      backgroundColor: theme.colors.surface,
                      padding: 12,
                      borderRadius: 4,
                    },
                    code_inline: {
                      backgroundColor: theme.colors.surface,
                      padding: 4,
                      borderRadius: 2,
                    },
                    blockquote: {
                      backgroundColor: theme.colors.surfaceVariant,
                      padding: 8,
                      borderLeftWidth: 4,
                      borderLeftColor: theme.colors.primary,
                    },
                    strong: { fontWeight: "bold" },
                    em: { fontStyle: "italic" },
                  }}
                >
                  {section.content}
                </Markdown>
                {index < sections.length - 1 && (
                  <Divider style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  introText: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  card: {
    marginBottom: 24,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: 8,
  },
  bulletDot: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  sectionsContainer: {
    marginTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  divider: {
    marginVertical: 24,
  },
});

export default ModuleContent;
