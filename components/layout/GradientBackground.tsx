import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function GradientBackground({ children }: Props) {
  return (
    <LinearGradient
  
      colors={["#FFF5E5", "#FFFFFF", "#FFFFFF"]}
      locations={[0, 0.3, 1]}
      style={styles.container}
    > 
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});