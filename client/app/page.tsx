import { Metadata } from "next";
import HomePage from "@/pages/HomePage";


export const metadata: Metadata = {
  title: 'All Snap Downloader',
  description: 'Download videos from YouTube in various formats',
}

export default function Home() {
  return <HomePage/>
}
