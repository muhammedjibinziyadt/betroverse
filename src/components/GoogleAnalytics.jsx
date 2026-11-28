"use client";

import { Suspense, useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import {
  GA_MEASUREMENT_ID,
  isAnalyticsEnabled,
  trackPageView,
} from "@/lib/gtag";

function RoutePageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrlRef = useRef(null);

  const search = searchParams ? searchParams.toString() : "";

  useEffect(() => {
    if (!pathname) return;
    const url = search ? `${pathname}?${search}` : pathname;
    if (lastTrackedUrlRef.current === url) return;

    lastTrackedUrlRef.current = url;
    trackPageView(url);
  }, [pathname, search]);

  return null;
}

export default function GoogleAnalytics() {
  if (!isAnalyticsEnabled()) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            send_page_view: false
          });
        `}
      </Script>
      <Suspense fallback={null}>
        <RoutePageViewTracker />
      </Suspense>
    </>
  );
}
