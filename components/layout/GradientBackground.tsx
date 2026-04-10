import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function GradientBackground({ children }: Props) {
  return (
    <LinearGradient
  
      colors={["#FFF5E5", "#FFFBF5", "#FFFFFF"]}
      locations={[0, 0.5, 1]}
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