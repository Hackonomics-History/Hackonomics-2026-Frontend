import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppBackground from "@/components/layouts/AppBackground";
import Button from "@/components/ui/Button";
import { api } from "@/api/client";
import { raiseAppError } from "@/common/errors/raiseAppError";
import { Newspaper, RefreshCw, TrendingUp } from "lucide-react";
import type { NewsItem } from "@/api/types";

type BusinessNewsResponse = {
    country_code?: string;
    news: NewsItem[];
};

function getFlagEmoji(code?: string) {
    if (!code) return "";
    return code
        .toUpperCase()
        .replace(/./g, char =>
            String.fromCodePoint(127397 + char.charCodeAt(0))
        );
}

function getCountryName(code?: string) {
    if (!code) return "";
    try {
        const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
        return regionNames.of(code);
    } catch {
        return code;
    }
}

export default function NewsPage() {
    const navigate = useNavigate();

    const [news, setNews] = useState<NewsItem[]>([]);
    const [countryCode, setCountryCode] = useState<string>();
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string>();

    const loadNews = useCallback(async () => {
        try {
            setLoading(true);

            const res = await api.get<BusinessNewsResponse>(
                "/news/business-news/"
            );

            const data = res.data;

            if (!Array.isArray(data.news)) {
                console.warn("Unexpected news format:", data);
                setNews([]);
                return;
            }

            setNews(data.news);
            setCountryCode(data.country_code);

            const today = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
            setLastUpdated(today);

        } catch (err: unknown) {
            raiseAppError(err, navigate, "Failed to load business news");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        loadNews();
    }, [loadNews]);

    return (
        <AppBackground>
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 p-6 sm:p-10">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Newspaper className="w-6 h-6 text-indigo-600" />

                                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    {countryCode && (
                                        <span className="text-2xl">
                                            {getFlagEmoji(countryCode)}
                                        </span>
                                    )}
                                    Business News
                                </h1>
                            </div>

                            <div className="flex items-center gap-3">
                                {lastUpdated && (
                                    <span className="text-xs text-gray-500">
                                        Updated {lastUpdated}
                                    </span>
                                )}

                                <Button
                                    onClick={loadNews}
                                    loading={loading}
                                    size="sm"
                                    variant="outline"
                                >
                                    <RefreshCw
                                        className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`}
                                    />
                                    Refresh
                                </Button>
                            </div>
                        </div>

                        {/* Subtitle */}
                        <p className="text-sm text-gray-500 mb-8">
                            Latest business developments affecting{" "}
                            {getCountryName(countryCode) || "your region"} and global markets.
                        </p>

                        {/* Loading skeleton */}
                        {loading && (
                            <div className="space-y-4 animate-pulse">
                                {[1, 2, 3].map(i => (
                                    <div
                                        key={i}
                                        className="p-4 rounded-xl bg-gray-200 h-24"
                                    />
                                ))}
                            </div>
                        )}

                        {/* News Cards */}
                        {!loading && news.length > 0 && (
                            <div className="space-y-4">
                                {news.map((item, idx) => (
                                    <div
                                        key={`${item.title}-${idx}`}
                                        className="
                      p-5 rounded-2xl border border-gray-200
                      shadow-sm hover:shadow-md transition
                      bg-white
                    "
                                    >
                                        <div className="flex items-start gap-3">
                                            <TrendingUp className="w-5 h-5 text-indigo-600 mt-1" />

                                            <div>
                                                <h2 className="font-semibold text-gray-900">
                                                    {item.title}
                                                </h2>

                                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty state */}
                        {!loading && news.length === 0 && (
                            <p className="text-gray-500 text-center">
                                No recent business news.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AppBackground>
    );
}