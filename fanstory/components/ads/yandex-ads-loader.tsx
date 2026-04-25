import Script from "next/script";
import { getRewardedAdUiConfig } from "@/server/monetization/rewarded-ads/provider";

export function YandexAdsLoader() {
  const config = getRewardedAdUiConfig();

  if (config.provider !== "yandex") {
    return null;
  }

  return (
    <>
      <Script id="yandex-ads-init" strategy="afterInteractive">
        {`window.yaContextCb = window.yaContextCb || [];`}
      </Script>
      <Script
        id="yandex-ads-loader"
        strategy="afterInteractive"
        src="https://yandex.ru/ads/system/context.js"
      />
    </>
  );
}
