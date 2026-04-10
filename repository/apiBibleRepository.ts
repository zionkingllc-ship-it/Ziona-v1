import { BibleRepository } from "./bibleRepository"
import axios from "axios"

export const apiBibleRepository: BibleRepository = {

  async getTranslations() {
    const res = await axios.get("/bible/translations")
    return res.data
  },

  async getBooks() {
    const res = await axios.get("/bible/books")
    return res.data
  },

  async getChapters(book: string) {
    const res = await axios.get(`/bible/chapters?book=${book}`)
    return res.data
  },

  async getVerses(translation, book, chapter) {
    const res = await axios.get(
      `/bible/verses?translation=${translation}&book=${book}&chapter=${chapter}`
    )

    return res.data
  },
}