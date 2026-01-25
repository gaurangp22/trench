import { Globe, Send, Twitter, MessageCircle, ExternalLink, ImageIcon } from "lucide-react";
import type { ProfileSocial, TokenWorkItem, PortfolioItem } from "@/lib/api";
import { formatMarketCap } from "@/lib/tokenLookup";

interface PortfolioTabProps {
    socials?: ProfileSocial[];
    tokenWork?: TokenWorkItem[];
    portfolio?: PortfolioItem[];
    isOwner?: boolean;
}

const SOCIAL_ICONS: Record<string, React.ElementType> = {
    website: Globe,
    twitter: Twitter,
    telegram: Send,
    discord: MessageCircle,
};

const SOCIAL_LABELS: Record<string, string> = {
    website: "Website",
    twitter: "Twitter",
    telegram: "Telegram",
    discord: "Discord",
};

export function PortfolioTab({ socials = [], tokenWork = [], portfolio = [] }: PortfolioTabProps) {
    return (
        <div className="space-y-8">
            {/* Socials Section */}
            {socials.length > 0 && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Socials
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {socials.map((social) => {
                            const Icon = SOCIAL_ICONS[social.platform] || Globe;
                            return (
                                <a
                                    key={social.platform}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700 rounded-lg text-zinc-300 hover:text-white transition-all group cursor-pointer"
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        {SOCIAL_LABELS[social.platform] || social.platform}
                                    </span>
                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* My Work Section - Token Work */}
            {tokenWork.length > 0 && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        My Work
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tokenWork.map((token) => {
                            const tokenUrl = token.chain === 'solana'
                                ? `https://dexscreener.com/solana/${token.contract_address}`
                                : `https://dexscreener.com/${token.chain}/${token.contract_address}`;

                            return (
                                <a
                                    key={token.id}
                                    href={tokenUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 hover:border-purple-500/50 transition-all group cursor-pointer block"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        {token.token_image_url ? (
                                            <img
                                                src={token.token_image_url}
                                                alt={token.token_name || "Token"}
                                                className="w-12 h-12 rounded-full object-cover ring-2 ring-zinc-700"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                                                {token.token_symbol?.charAt(0) || "?"}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-medium truncate group-hover:text-purple-400 transition-colors">
                                                {token.token_name || "Unknown Token"}
                                            </h4>
                                            <p className="text-sm text-zinc-400">
                                                ${token.token_symbol || "???"}
                                            </p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    {/* ATH Badge */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500 uppercase tracking-wider">
                                            ATH Market Cap
                                        </span>
                                        <span className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-sm font-medium">
                                            {formatMarketCap(token.ath_market_cap)}
                                        </span>
                                    </div>

                                    {/* Chain indicator */}
                                    <div className="mt-2 pt-2 border-t border-zinc-700/50">
                                        <span className="text-xs text-zinc-500">
                                            {token.chain === 'solana' ? '◎ Solana' : token.chain}
                                        </span>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Gallery Section - Portfolio Items */}
            {portfolio.length > 0 && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Gallery
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {portfolio.map((item) => (
                            <a
                                key={item.id}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative aspect-square bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer"
                            >
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-zinc-600" />
                                    </div>
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <h4 className="text-white font-medium text-sm truncate">
                                            {item.title}
                                        </h4>
                                        {item.description && (
                                            <p className="text-zinc-400 text-xs truncate mt-1">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {socials.length === 0 && tokenWork.length === 0 && portfolio.length === 0 && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">
                        No Portfolio Yet
                    </h3>
                    <p className="text-zinc-400 text-sm">
                        This freelancer hasn't added any portfolio items yet.
                    </p>
                </div>
            )}
        </div>
    );
}

export default PortfolioTab;
