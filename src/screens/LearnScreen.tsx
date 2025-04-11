import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Text, Title, Paragraph, Button } from "react-native-paper";
import { HeaderBar, KlareCard } from "../components/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { klareColors } from "../constants/theme";

export default function LearnScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <HeaderBar 
        title="Lerninhalte"
        showSearch
        onSearchPress={() => {/* Handle search */}}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.verticalAccent} />
          <Text style={styles.welcomeText}>Willkommen zur KLARE Methode</Text>
          <Text style={styles.subtitle}>Dein Weg zu mehr Kongruenz</Text>
        </View>

        <KlareCard>
          <View style={styles.learningSection}>
            <Title style={styles.cardTitle}>Dein Lernfortschritt</Title>
            <Paragraph style={styles.cardDescription}>Heute noch keine Übungen abgeschlossen</Paragraph>
            
            <View style={styles.progressIndicator}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '0%' }]} />
              </View>
              <Text style={styles.progressText}>0% abgeschlossen</Text>
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <Button 
              mode="contained" 
              style={{ backgroundColor: klareColors.k }}
              onPress={() => {}}
            >
              Weiter lernen
            </Button>
          </View>
        </KlareCard>

        <Text style={styles.sectionTitle}>KLARE Methode Schritte</Text>

        {/* Platzhalter für die KLARE-Schritte mit dem neuen Design */}
        {['K', 'L', 'A', 'R', 'E'].map((letter, index) => (
          <KlareCard 
            key={letter}
            style={styles.stepCard}
            onPress={() => navigation.navigate("KlareMethod" as never, { step: letter } as never)}
          >
            <View style={styles.stepHeader}>
              <View style={[
                styles.stepBadge, 
                { backgroundColor: `${klareColors[letter.toLowerCase()]}20` }
              ]}>
                <Text style={{ color: klareColors[letter.toLowerCase()], fontWeight: 'bold' }}>{letter}</Text>
              </View>
              <Text style={styles.stepTitle}>
                {letter === 'K' && 'Klarheit'}
                {letter === 'L' && 'Lebendigkeit'}
                {letter === 'A' && 'Ausrichtung'}
                {letter === 'R' && 'Realisierung'}
                {letter === 'E' && 'Entfaltung'}
              </Text>
            </View>
            <Text style={styles.stepDescription}>
              {letter === 'K' && 'Erkenne deine aktuelle Situation.'}
              {letter === 'L' && 'Aktiviere deine Ressourcen.'}
              {letter === 'A' && 'Bringe dein Leben in Einklang.'}
              {letter === 'R' && 'Setze konkrete Schritte um.'}
              {letter === 'E' && 'Erlebe mühelose Manifestation.'}
            </Text>
          </KlareCard>
        ))}
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
    paddingBottom: 32,
  },
  heroSection: {
    padding: 8,
    paddingTop: 16,
    marginBottom: 24,
    position: 'relative',
  },
  verticalAccent: {
    position: 'absolute',
    left: 0,
    top: 20,
    width: 4,
    height: 60,
    backgroundColor: klareColors.k,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: klareColors.text,
    marginBottom: 8,
    paddingLeft: 16,
  },
  subtitle: {
    fontSize: 16,
    color: klareColors.textSecondary,
    marginBottom: 16,
    paddingLeft: 16,
  },
  learningSection: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: klareColors.text,
    marginBottom: 8,
  },
  cardDescription: {
    color: klareColors.textSecondary,
    marginBottom: 16,
  },
  progressIndicator: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: klareColors.k,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: klareColors.textSecondary,
    textAlign: 'right',
  },
  buttonContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: klareColors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  stepCard: {
    marginBottom: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: klareColors.text,
  },
  stepDescription: {
    fontSize: 14,
    color: klareColors.textSecondary,
    lineHeight: 20,
  },
});
