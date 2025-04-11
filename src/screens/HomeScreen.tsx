// src/screens/HomeScreen.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Animated,
  StatusBar,
  Platform,
} from "react-native";
import {
  Text,
  Button,
  ProgressBar,
  Divider,
  List,
  Chip,
} from "react-native-paper";
import { HeaderBar, KlareCard } from "../components/common";
import KlareStepCard from "../components/KlareStepCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { klareColors } from "../constants/theme";
import { useUserStore } from "../store/useUserStore";
import { klareSteps } from "../data/klareMethodData";
import KlareLogo from "../components/KlareLogo";

export default function HomeScreen() {
  const navigation = useNavigation();
  const user = useUserStore((state) => state.user);
  const lifeWheelAreas = useUserStore((state) => state.lifeWheelAreas);
  const getModuleProgress = useUserStore((state) => state.getModuleProgress);
  const getDaysInProgram = useUserStore((state) => state.getDaysInProgram);
  const getCurrentStage = useUserStore((state) => state.getCurrentStage);
  const getNextStage = useUserStore((state) => state.getNextStage);
  const getAvailableModules = useUserStore((state) => state.getAvailableModules);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayTip, setTodayTip] = useState("");
  
  // Animation für Stage-Fortschritt
  const translateY = React.useRef(new Animated.Value(50)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  // Aktuelle Stage und Fortschritt
  const currentStage = getCurrentStage();
  const nextStage = getNextStage();
  const daysInProgram = getDaysInProgram(); 
  const availableModules = getAvailableModules();

  // Tipps des Tages
  const dailyTips = [
    "Reflektieren Sie über Momente, in denen Sie bereits vollständige Kongruenz erlebt haben.",
    "Nehmen Sie sich heute Zeit, um einen Bereich Ihres Lebensrads genauer zu betrachten.",
    "Probieren Sie eine kleine Übung aus dem Bereich 'Lebendigkeit' aus.",
    "Identifizieren Sie eine Situation, in der Denken, Fühlen und Handeln nicht im Einklang sind.",
    "Setzen Sie heute einen Mini-Schritt in Richtung Ihrer gewünschten Ziele um.",
    "Fragen Sie sich: 'Wann fühle ich mich heute am lebendigsten?'",
    "Üben Sie bewusst, innere und äußere Kongruenz in einer herausfordernden Situation.",
  ];

  // Berechne den Fortschritt für jeden KLARE-Schritt
  const stepProgress = {
    K: getModuleProgress("K"),
    L: getModuleProgress("L"),
    A: getModuleProgress("A"),
    R: getModuleProgress("R"),
    E: getModuleProgress("E"),
  };

  // Aktualisiert die Uhrzeit jede Minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Animation für Stage-Fortschritt
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Wählt einen Tipp des Tages basierend auf dem Datum
  useEffect(() => {
    const date = new Date();
    const dayOfYear = Math.floor(
      (date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24),
    );
    const tipIndex = dayOfYear % dailyTips.length;
    setTodayTip(dailyTips[tipIndex]);
  }, []);

  // Formatiert die Uhrzeit als Grußtext
  const getGreeting = () => {
    const hour = currentTime.getHours();

    if (hour < 12) {
      return "Guten Morgen";
    } else if (hour < 18) {
      return "Guten Tag";
    } else {
      return "Guten Abend";
    }
  };

  // Berechnet den durchschnittlichen Wert aller Lebensbereiche
  const calculateLifeWheelAverage = () => {
    if (!lifeWheelAreas || lifeWheelAreas.length === 0) return 0;

    const sum = lifeWheelAreas.reduce(
      (acc, area) => acc + area.currentValue,
      0,
    );
    return Math.round((sum / lifeWheelAreas.length) * 10) / 10;
  };

  // Findet die niedrigsten bewerteten Bereiche
  const findLowestAreas = () => {
    if (!lifeWheelAreas || lifeWheelAreas.length === 0) return [];

    return lifeWheelAreas
      .sort((a, b) => a.currentValue - b.currentValue)
      .slice(0, 2);
  };

  // Bestimme die nächsten Aktivitäten basierend auf verfügbaren Modulen
  const getNextActivities = () => {
    const activities = [];
    
    // Tägliche Aktivität hinzufügen
    activities.push({
      id: "activity-daily",
      title: "Tägliche Kongruenz-Praxis",
      description: "5-Minuten Übung für mehr Kongruenz",
      type: "daily",
      step: "R",
    });
    
    // Wöchentliche Aktivität hinzufügen
    if (daysInProgram % 7 === 0 || daysInProgram % 7 === 6) {
      activities.push({
        id: "activity-weekly",
        title: "Lebensrad aktualisieren",
        description: "Wöchentliche Überprüfung Ihrer Fortschritte",
        type: "weekly",
        step: "K",
      });
    }
    
    // Nächstes verfügbares Modul finden
    for (const step of klareSteps) {
      const moduleIds = availableModules.filter(id => id.startsWith(step.id.toLowerCase()));
      if (moduleIds.length > 0) {
        activities.push({
          id: `activity-module-${step.id}`,
          title: `${step.id} - ${step.title} fortsetzen`,
          description: `Nächstes verfügbares Modul in dieser Phase`,
          type: "module",
          step: step.id,
        });
        break;
      }
    }
    
    return activities.slice(0, 3); // Maximal 3 Aktivitäten anzeigen
  };

  const nextActivities = getNextActivities();

  // Berechnet die Streak-Tage
  const streakDays = user?.streak || daysInProgram;

  // Formatiere ein Datum benutzerfreundlich
  const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('de-DE', options);
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={klareColors.statusBarColor}
      />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeaderBar 
          showAvatar
          avatarLetter={user?.name?.charAt(0) || "S"}
          greeting={getGreeting()}
          userName={user?.name || "Sascha"}
          showSearch
          onSearchPress={() => {/* Handle search */}}
        />

        {/* Hero section with "What's bothering you today?" */}
        <View style={styles.heroSection}>
          <View style={styles.verticalAccent} />
          <Text style={styles.heroTitle}>
            Was beschäftigt{'\n'}Dich <Text style={{color: klareColors.k}}>heute?</Text>
          </Text>
          <View style={styles.accentLine} />
        </View>
        
        {/* KLARE Journey Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Deine KLARE Reise</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {klareSteps.map((step) => (
              <KlareStepCard
                key={step.id}
                step={step}
                progress={stepProgress[step.id]}
                isActive={false}
                onPress={() =>
                  navigation.navigate(
                    "KlareMethod" as never,
                    { step: step.id } as never,
                  )
                }
              />
            ))}
          </ScrollView>
        </View>
        
        {/* Today for you section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Heute für dich</Text>
          
          {nextActivities.length > 0 && (
            <KlareCard 
              showAccent 
              accentColor={klareColors.k}
              onPress={() => {
                const activity = nextActivities[0];
                if (activity.type === "module") {
                  navigation.navigate(
                    "KlareMethod" as never,
                    { step: activity.step } as never
                  );
                } else if (activity.type === "daily") {
                  // Start daily exercise
                } else if (activity.type === "weekly") {
                  navigation.navigate("LifeWheel" as never);
                }
              }}
            >
              <View style={styles.cardHeader}>
                <View style={[
                  styles.tag, 
                  { backgroundColor: `${klareColors.k}20` }
                ]}>
                  <Text style={styles.tagText}>Tägliche Praxis</Text>
                </View>
                
                <Text style={styles.duration}>15 Minuten</Text>
              </View>
              
              <Text style={styles.cardTitle}>Kongruenz-Check</Text>
              
              <Text style={styles.cardDescription}>
                Erlebe mehr Klarheit und inneren Frieden, indem du deine Gedanken, Gefühle und Handlungen in Einklang bringst.
              </Text>
              
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.buttonText}>Jetzt starten</Text>
                <Ionicons name="arrow-forward" size={18} color="white" style={{marginLeft: 8}} />
              </TouchableOpacity>
            </KlareCard>
          )}
        </View>
        
        {/* Life Wheel Preview */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Dein Lebensrad</Text>
          
          <KlareCard>
            <View style={styles.wheelVisualization}>
              <View style={[styles.wheelLayer, { width: '100%', height: '100%', borderColor: 'rgba(167, 139, 250, 0.2)' }]} />
              <View style={[styles.wheelLayer, { width: '80%', height: '80%', borderColor: 'rgba(245, 158, 11, 0.2)' }]} />
              <View style={[styles.wheelLayer, { width: '60%', height: '60%', borderColor: 'rgba(236, 72, 153, 0.2)' }]} />
              <View style={[styles.wheelLayer, { width: '40%', height: '40%', borderColor: 'rgba(16, 185, 129, 0.2)' }]} />
              
              <View style={styles.wheelCenter}>
                <Text style={styles.wheelValue}>{calculateLifeWheelAverage()}</Text>
              </View>
            </View>
            
            <Text style={styles.wheelText}>
              Aktueller Durchschnittswert aller Lebensbereiche
            </Text>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.navigate("LifeWheel" as never)}
            >
              <Text style={styles.secondaryButtonText}>Details anzeigen</Text>
            </TouchableOpacity>
          </KlareCard>
        </View>
        
        {/* Tip of the Day */}
        <View style={styles.tipCardContainer}>
          <TouchableOpacity activeOpacity={0.9} style={styles.tipCard}>
            <View style={[styles.circleDecoration, styles.circleLarge]} />
            <View style={[styles.circleDecoration, styles.circleSmall]} />
            
            <View style={styles.tipIcon}>
              <Ionicons name="bulb-outline" size={24} color="white" />
            </View>
            
            <Text style={styles.tipTitle}>Tipp des Tages</Text>
            
            <Text style={styles.tipText}>{todayTip}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Stats Summary */}
        <Animated.View
          style={[
            styles.statsSummary,
            {
              opacity,
              transform: [{ translateY: translateY.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 20]
              }) }],
            }
          ]}
        >
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{daysInProgram}</Text>
            <Text style={styles.statLabel}>Tage</Text>
          </View>

          <View style={styles.statDivider}></View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {availableModules.length}/35
            </Text>
            <Text style={styles.statLabel}>Module</Text>
          </View>

          <View style={styles.statDivider}></View>

          <View style={styles.statItem}>
            <View style={styles.streakContainer}>
              <Text style={styles.statValue}>{streakDays}🔥</Text>
            </View>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </Animated.View>

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
    paddingBottom: 100, // Extra padding for bottom tab bar
  },
  // Header styles
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: Platform.OS === 'android' ? 12 : 0,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: klareColors.k,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  greeting: {
    fontSize: 14,
    color: klareColors.textSecondary,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: klareColors.text,
  },
  searchButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  searchButtonText: {
    color: klareColors.text,
  },
  
  // Hero section styles
  heroSection: {
    padding: 16,
    paddingTop: 24,
    marginBottom: 16,
    position: 'relative',
  },
  verticalAccent: {
    position: 'absolute',
    left: 0,
    top: 30,
    width: 4,
    height: 80,
    backgroundColor: klareColors.k,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: klareColors.text,
    lineHeight: 40,
    marginBottom: 8,
  },
  accentLine: {
    height: 3,
    width: 80,
    backgroundColor: klareColors.l,
    marginVertical: 16,
    borderRadius: 2,
  },
  
  // Section container
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: klareColors.text,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  horizontalScrollContent: {
    paddingRight: 16,
  },
  
  // KLARE Cards
  klareCard: {
    width: 170,
    minHeight: 220,
    backgroundColor: klareColors.cardBackground,
    borderRadius: 20,
    marginRight: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: klareColors.cardBorder,
  },
  klareCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  klareIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  minutes: {
    color: klareColors.textSecondary,
    fontSize: 12,
  },
  klareLetter: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  klareTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: klareColors.text,
    marginBottom: 8,
  },
  klareDescription: {
    fontSize: 13,
    color: klareColors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
    flex: 1,
  },
  progressBarContainer: {
    marginTop: 'auto',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressText: {
    fontSize: 12,
    color: klareColors.textSecondary,
  },
  progressValue: {
    fontSize: 12,
    color: klareColors.text,
    fontWeight: '600',
  },
  
  // Today's activity card
  todayCard: {
    backgroundColor: klareColors.cardBackground,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: klareColors.cardBorder,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: klareColors.k,
    fontSize: 12,
    fontWeight: '600',
  },
  duration: {
    color: klareColors.textSecondary,
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: klareColors.text,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: klareColors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: klareColors.k,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  
  // Life wheel card
  lifeWheelCard: {
    backgroundColor: klareColors.cardBackground,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: klareColors.cardBorder,
    alignItems: "center",
    marginBottom: 8,
  },
  wheelVisualization: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
    position: 'relative',
  },
  wheelLayer: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 20,
    borderStyle: 'solid',
  },
  wheelCenter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: klareColors.k,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  wheelValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  wheelText: {
    fontSize: 14,
    color: klareColors.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: "center",
  },
  secondaryButtonText: {
    color: klareColors.text,
    fontWeight: '500',
  },
  
  // Tip card
  tipCardContainer: {
    padding: 0,
    marginBottom: 32,
  },
  tipCard: {
    backgroundColor: klareColors.k,
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  circleDecoration: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circleLarge: {
    right: -20,
    top: -20,
    width: 120,
    height: 120,
  },
  circleSmall: {
    left: -10,
    bottom: -30,
    width: 80,
    height: 80,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: 'white',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  
  // Stats summary
  statsSummary: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 24,
    paddingVertical: 16,
    backgroundColor: klareColors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: klareColors.cardBorder,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: klareColors.text,
  },
  statLabel: {
    fontSize: 12,
    color: klareColors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: "60%",
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'center',
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
