import { useEffect, useState } from "react"
import { bibleRepository } from "@/repository"
import { BibleTranslation } from "@/types/bible"

export function useBibleTranslations() {
  const [data, setData] = useState<BibleTranslation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    bibleRepository.getTranslations().then((res: BibleTranslation[] | undefined) => {
      setData(res ?? [])
      setLoading(false)
    })
  }, [])

  return { data, loading }
}