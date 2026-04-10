
import { View, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import { useRef } from 'react';
import { ResizeMode } from 'expo-av';

export default function TestVideo() {
  const videoRef = useRef(null);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{
          uri: 'https://www.w3schools.com/html/mov_bbb.mp4',
        }}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping
        useNativeControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: 300,
  },
});