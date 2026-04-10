import { View } from "tamagui"
import { ReactNode } from "react"
import { useResponsive } from "@/hooks/useResponsive"

type Props = {
  children: ReactNode
}

export const FullScreenContainer = ({ children }: Props) => {
  const { viewportHeight, insets } = useResponsive()

  return (
    <View
      height={viewportHeight}
      paddingTop={insets.top}
      paddingBottom={insets.bottom}
      flexShrink={0}
    >
      {children}
    </View>
  )
}