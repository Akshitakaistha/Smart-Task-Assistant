import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Mail, Phone, Globe, Shield, User, Users } from 'lucide-react-native';

export default function AboutScreen() {
  const router = useRouter();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      console.log('Failed to open URL');
    });
  };

  return (
    <View style={styles.container}>
      {/* Set route header */}
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'About Us',
          headerStyle: {
            backgroundColor: '#3498DB',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700',
          },
        }}
      />

      {/* Main Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Our Team */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Users size={32} color="#3498DB" />
            <Text style={styles.cardTitle}>Our Team</Text>
          </View>
          <Text style={styles.cardText}>
            We are a passionate team of developers and designers dedicated to creating intuitive and 
            efficient productivity tools. Our mission is to help people organize their lives and work 
            more effectively through smart technology solutions.
          </Text>
        </View>

        {/* Developer */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <User size={32} color="#3498DB" />
            <Text style={styles.cardTitle}>Developer</Text>
          </View>
          <Text style={styles.cardText}>
            Smart Task Assistant is developed by Development Logics with expertise in 
            creating cross-platform mobile applications. Our commitment is to deliver high-quality, 
            user-friendly applications that enhance productivity.
          </Text>
        </View>

        {/* Contact */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Mail size={32} color="#3498DB" />
            <Text style={styles.cardTitle}>Contact Us</Text>
          </View>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => openLink('mailto:support@smarttaskassistant.com')}
          >
            <Mail size={20} color="#3498DB" />
            <Text style={styles.contactText}>support@smarttaskassistant.com</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => openLink('tel:+11234567890')}
          >
            <Phone size={20} color="#3498DB" />
            <Text style={styles.contactText}>+1 (123) 456-7890</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => openLink('https://smarttaskassistant.com')}
          >
            <Globe size={20} color="#3498DB" />
            <Text style={styles.contactText}>www.smarttaskassistant.com</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Policy */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Shield size={32} color="#3498DB" />
            <Text style={styles.cardTitle}>Privacy Policy</Text>
          </View>
          <Text style={[styles.cardText, { marginBottom: 10 }]}>
            Smart Task Assistant values your privacy. We want you to know that we do not collect, store, 
            or share any personal data from your device.
            All your tasks, reminders, and related information are stored locally on your own device. This means your data stays completely private 
            — we do not send or save it on any external servers or cloud systems.
          </Text>
          <Text style={styles.cardText}>
            We also do not access or track your location, contacts, microphone, or any other personal information.
            Your data belongs to you and remains fully under your control.
            If you uninstall the app, all stored data will be removed from your device automatically.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 6,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 8,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#F1F5F9',
    borderBottomWidth: 1,
  },
  contactText: {
    fontSize: 15,
    color: '#475569',
    marginLeft: 8,
  },
});
