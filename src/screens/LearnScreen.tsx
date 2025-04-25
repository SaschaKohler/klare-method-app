import { useNavigation } from "@react-navigation/native";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Card, Paragraph, Text, Title } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { klareColors } from "../constants/theme";

export default function LearnScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.welcomeText}>Willkommen zur KLARE Methode</Text>
        <Text style={styles.subtitle}>Dein Weg zu mehr Kongruenz</Text>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Lernen</Title>
            <Paragraph>Heute noch keine Übungen abgeschlossen</Paragraph>
            {/* Hier kommt später eine Fortschrittsvisualisierung */}
          </Card.Content>
          <Card.Actions>
            <Button>Weiter lernen</Button>
          </Card.Actions>
        </Card>

        <Text style={styles.sectionTitle}>KLARE Methode Schritte</Text>

        {/* Hier kommen später die KLARE-Methodenschritte */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: klareColors.background,
  },
  scrollContent: {
    padding: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: klareColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: klareColors.textSecondary,
    marginBottom: 24,
  },
  card: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: klareColors.text,
    marginBottom: 16,
  },
});
