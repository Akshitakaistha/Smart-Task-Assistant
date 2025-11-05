import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { Mic, MicOff } from 'lucide-react-native';

interface VoiceButtonProps {
  onTranscription: (text: string) => void;
  buttonText?: string;
  size?: 'small' | 'medium' | 'large';
}

export function VoiceButton({ onTranscription, buttonText, size = 'large' }: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulse = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const startRecording = async () => {
    try {
      console.log('Requesting audio permissions...');
      const { status } = await Audio.requestPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Audio permission not granted');
        return;
      }

      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }

      console.log('Starting recording...');
      const recording = new Audio.Recording();
      
      const recordingOptions = Platform.select({
        android: {
          android: {
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: '.wav',
            outputFormat: Audio.IOSOutputFormat.LINEARPCM,
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {
            extension: '.webm',
            mimeType: 'audio/webm',
            bitsPerSecond: 128000,
          },
        },
        ios: {
          android: {
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: '.wav',
            outputFormat: Audio.IOSOutputFormat.LINEARPCM,
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {
            extension: '.webm',
            mimeType: 'audio/webm',
            bitsPerSecond: 128000,
          },
        },
        web: {
          android: {
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: '.wav',
            outputFormat: Audio.IOSOutputFormat.LINEARPCM,
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {
            extension: '.webm',
            mimeType: 'audio/webm',
            bitsPerSecond: 128000,
          },
        },
      });

      await recording.prepareToRecordAsync(recordingOptions);

      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      startPulse();
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      console.log('Stopping recording...');
      
      if (!recordingRef.current) {
        console.log('No recording found');
        return;
      }

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      
      setIsRecording(false);
      stopPulse();

      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
      }

      console.log('Recording stopped, URI:', uri);

      if (!uri) {
        console.log('No URI found');
        return;
      }

      setIsProcessing(true);
      
      try {
        const formData = new FormData();
        
        if (Platform.OS === 'web') {
          const response = await fetch(uri);
          const blob = await response.blob();
          formData.append('audio', blob, 'recording.webm');
        } else {
          const uriParts = uri.split('.');
          const fileType = uriParts[uriParts.length - 1];
          
          const audioFile = {
            uri,
            name: `recording.${fileType}`,
            type: `audio/${fileType}`,
          } as any;
          
          formData.append('audio', audioFile);
        }

        console.log('Sending audio to transcription API...');
        const response = await fetch('https://toolkit.rork.com/stt/transcribe/', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Transcription failed');
        }

        const result = await response.json();
        console.log('Transcription result:', result);
        
        onTranscription(result.text);
      } catch (error) {
        console.error('Failed to transcribe:', error);
      } finally {
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
      stopPulse();
    }
  };

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const getSize = () => {
    switch (size) {
      case 'small':
        return 50;
      case 'medium':
        return 70;
      case 'large':
        return 90;
      default:
        return 90;
    }
  };

  const buttonSize = getSize();
  const iconSize = buttonSize * 0.4;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={isProcessing}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.button,
            {
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
              transform: [{ scale: pulseAnim }],
              backgroundColor: isRecording ? '#E74C3C' : '#3498DB',
            },
          ]}
        >
          {isProcessing ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : isRecording ? (
            <MicOff size={iconSize} color="#FFFFFF" />
          ) : (
            <Mic size={iconSize} color="#FFFFFF" />
          )}
        </Animated.View>
      </TouchableOpacity>
      
      {buttonText && (
        <Text style={styles.buttonText}>{buttonText}</Text>
      )}
      
      {isRecording && (
        <Text style={styles.recordingText}>Recording...</Text>
      )}
      
      {isProcessing && (
        <Text style={styles.processingText}>Processing...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      } as any,
    }),
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#2C3E50',
    marginTop: 8,
  },
  recordingText: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '600' as const,
    marginTop: 4,
  },
  processingText: {
    fontSize: 14,
    color: '#3498DB',
    fontWeight: '600' as const,
    marginTop: 4,
  },
});
