"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function PagePreloader() {
    const [isRouting, setIsRouting] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // 1. Turn OFF the loader when the route change completes
    useEffect(() => {
        setIsRouting(false);
    }, [pathname, searchParams]);

    // 2. Turn ON the loader when an internal link is clicked
    useEffect(() => {
        const handleDocumentClick = (e: MouseEvent) => {
            // Find the closest anchor tag that was clicked
            const anchor = (e.target as HTMLElement).closest("a");
            
            if (anchor && anchor.href) {
                const targetUrl = new URL(anchor.href);
                const currentUrl = new URL(window.location.href);

                // Check if the link is internal
                const isInternal = targetUrl.origin === currentUrl.origin;
                // Check if we are actually going to a new page (ignoring simple #hash links)
                const isDifferentPage = targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search;
                // Check that it's not opening in a new tab
                const isNotNewTab = anchor.target !== "_blank";

                if (isInternal && isDifferentPage && isNotNewTab) {
                    setIsRouting(true);
                }
            }
        };

        // Attach listener to the whole document
        document.addEventListener("click", handleDocumentClick);
        
        return () => {
            document.removeEventListener("click", handleDocumentClick);
        };
    }, []);

    return (
        <>
            {/* Added dynamic opacity classes here to utilize your transition duration */}
            <div 
                className={`fixed top-0 left-0 right-0 h-[3px] bg-muted z-[9999] transition-opacity duration-500 ${
                    isRouting ? "opacity-100" : "opacity-0 pointer-events-none delay-500"
                }`}
            >
                <div className="h-full bg-primary relative overflow-hidden w-full">
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 -translate-x-full animate-shimmer-run bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </div>
            </div>

            <style jsx global>{`
                @keyframes shimmer-run {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                .animate-shimmer-run {
                    animation: shimmer-run 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
            `}</style>
        </>
    );
}