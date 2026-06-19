"use client";
import Link from "next/link";
import { useState } from "react";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { TEXT, IMAGES } from "@/branding";
import Image from "next/image";
import SafeImage from "@/components/ui/SafeImage";
import { useAppSettings } from "@/lib/settingsContext";

export default function Footer() {
  const { settings, socialLinks, pages } = useAppSettings();
  const [descExpanded, setDescExpanded] = useState(false);

  return (
    <footer>
      {/* Social icons strip — icons sit centered on top of a horizontal golden line */}
      <div className="relative py-5 bg-footerBg dark:bg-dm-footerBg" >
        {/* Full-width golden line */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[1px] bg-secondary"
        />
        {/* Icons centered on top of the line */}
        <div className="relative flex justify-center gap-3">
          {socialLinks.map((data) => (
            <a key={data.id} href={data.url} target="_blank" rel="noopener noreferrer" aria-label={data.name}
              className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center transition-all hover:opacity-80 hover:scale-110"
              style={{ color: "#5C4A00" }}>
              <Image
                src={data.image}
                alt={data.name}
                width={20}
                height={20}
                className="w-5 h-5 object-contain"
              />
            </a>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="py-12  bg-footerBg dark:bg-dm-footerBg" >
        <div className="container-custom grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="flex flex-col items-center">
            <div className="dark:bg-secondary dark:rounded-lg dark:pl-2 dark:pr-2 dark:pt-1 dark:pb-1">
              <SafeImage
                src={IMAGES.appLogo}
                alt="DTBasket logo"
                width={724}
                height={188}
                className="w-36 h-auto object-contain"
                priority
              />
            </div>

            <div className="text-sm text-gray-500 dark:text-dm-muted leading-relaxed text-center">
              <p className={descExpanded ? "" : "line-clamp-[7]"}>
                {settings.appDescription || TEXT.footer.description}
              </p>
              <button
                onClick={() => setDescExpanded(v => !v)}
                className="mt-1 text-xs font-semibold text-primary-700 hover:underline focus:outline-none"
              >
                {descExpanded ? TEXT.common.viewLess : TEXT.common.viewMore}
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-dm-text text-base mb-4">{TEXT.footer.quickLinks.heading}</h3>
            <ul className="space-y-2.5">
              {TEXT.footer.quickLinks.links.map((l) => (
                <li key={l.href}>
                  {l.newTab
                    ? <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 dark:text-dm-muted hover:text-primary-700 transition-colors">{l.label}</a>
                    : <Link href={l.href} className="text-sm text-gray-500 dark:text-dm-muted hover:text-primary-700 transition-colors">{l.label}</Link>
                  }
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-dm-text text-base mb-4">{TEXT.footer.contact.heading}</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-dm-muted">
                <FiMapPin size={14} className="text-gray-400 dark:text-dm-muted flex-shrink-0 mt-0.5" />
                <span>{TEXT.footer.contact.address}</span>
              </div>
              <a href={`mailto:${settings.email || TEXT.footer.contact.email}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-700 transition-colors dark:text-dm-text">
                <FiMail size={14} className="text-gray-400 dark:text-dm-muted flex-shrink-0" />
                {settings.email || TEXT.footer.contact.email}
              </a>
              <a href={`tel:+${settings.contact || TEXT.footer.contact.phone}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-700 transition-colors dark:text-dm-text">
                <FiPhone size={14} className="text-gray-400 dark:text-dm-muted flex-shrink-0" />
                +{settings.contact || TEXT.footer.contact.phone}
              </a>
              <a href={`https://wa.me/${settings.contact || TEXT.footer.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-700 transition-colors dark:text-dm-text">
                {/* WhatsApp */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-green-500 flex-shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.115 1.523 5.847L.057 23.882l6.162-1.437A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.88 0-3.636-.493-5.154-1.355l-.368-.218-3.813.89.929-3.721-.241-.383A9.951 9.951 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                +{settings.contact || TEXT.footer.contact.whatsapp}
              </a>
            </div>
          </div>

          {/* Policies */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-dm-text text-base mb-4">{TEXT.footer.policies.heading}</h3>
            <ul className="space-y-2.5">
              {pages.length > 0
                ? pages.map(p => (
                  <li key={p.url}>
                    <a href={p.url} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-gray-500 dark:text-dm-muted hover:text-primary-700 transition-colors">
                      {p.title}
                    </a>
                  </li>
                ))
                : TEXT.footer.policies.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-gray-500 dark:text-dm-muted hover:text-primary-700 transition-colors">{l.label}</Link>
                  </li>
                ))
              }
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-gray-900 py-4 px-4 bg-secondary dark:bg-dm-secondary">
        <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-black dark:text-white">
            {TEXT.footer.copyright}
          </p>

          {/* App buttons */}
          <div className="flex items-center gap-3 bg-secondary" >
            <a href={TEXT.appStore.googlePlay} target="_blank" rel="noopener noreferrer"
            >
              <SafeImage
                src={IMAGES.playStore}
                alt="Get it on Google Play"
                width={720}
                height={211}
                className="h-9 w-auto object-contain"
                priority
              />
            </a>
            <a href={TEXT.appStore.appStore} target="_blank" rel="noopener noreferrer"
            >
              <SafeImage
                src={IMAGES.appStore}
                alt="Download on the App Store"
                width={720}
                height={211}
                className="h-9 w-auto object-contain"
                priority
              />
            </a>
          </div>

          <p className="text-xs text-black dark:text-white">{TEXT.footer.poweredBy}</p>
        </div>
      </div>
    </footer>
  );
}
