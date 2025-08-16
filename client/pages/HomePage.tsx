"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Download, Youtube, Facebook, Instagram, Music, Globe } from "lucide-react";

export default function HomePage() {
  const sites = [
    { name: "YouTube", icon: Youtube, href: "/youtube", color: "text-red-500" },
    { name: "Facebook", icon: Facebook, href: "/facebook", color: "text-blue-600" },
    { name: "TikTok", icon: Music, href: "/tiktok", color: "text-black dark:text-white" },
    { name: "Instagram", icon: Instagram, href: "/instagram", color: "text-pink-500" },
    { name: "Twitter/X", icon: Globe, href: "/x", color: "text-sky-500" },
    { name: "LinkedIn", icon: Globe, href: "/linkedin", color: "text-blue-700" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-grow px-6 py-20 text-center">
        <motion.h1
          className="text-4xl sm:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Download Videos from <span className="text-red-500">Anywhere</span>
        </motion.h1>
        <motion.p
          className="text-lg sm:text-xl max-w-2xl mb-8 text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Our downloader supports popular sites like YouTube, Facebook, TikTok, Instagram and more — all for free and without ads.
        </motion.p>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Link
            href="/youtube"
            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition"
          >
            <Download size={20} />
            Start Downloading
          </Link>
        </motion.div>
      </section>

      {/* Available Sites */}
      <section className="px-6 py-16 bg-white dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-10">Available Sites</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 max-w-5xl mx-auto">
          {sites.map((site, index) => (
            <motion.div
              key={site.name}
              className="flex flex-col items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-xl shadow hover:shadow-lg cursor-pointer transition"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={site.href} className="flex flex-col items-center gap-2">
                <site.icon size={36} className={site.color} />
                <span className="font-medium">{site.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Why Choose Us?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-6xl mx-auto text-center">
          {[
            { title: "Fast Downloads", desc: "Our servers are optimized for high-speed downloads with no waiting time." },
            { title: "Unlimited Usage", desc: "No limits — download as many videos as you want, for free." },
            { title: "High Quality", desc: "Choose the resolution and format you need, including Full HD and 4K." },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
