import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
    Loader2, Search, Package, Star, Eye, Clock, ShoppingBag, Tag,
    ChevronRight, Palette, Code, Megaphone, PenTool,
    Boxes, Gamepad2, LineChart, Globe, FileText, Sparkles, SlidersHorizontal, X
} from "lucide-react"
import { ServiceAPI, type Service } from "@/lib/api"
import { cn } from "@/lib/utils"

// Hierarchical category structure
const CATEGORY_HIERARCHY = [
    {
        id: "art-illustration",
        name: "Art & Illustration",
        icon: Palette,
        subcategories: [
            { id: "digital-painting", name: "Digital Painting" },
            { id: "anime-manga", name: "Anime/Manga Illustration" },
            { id: "concept-art", name: "Concept Art" },
            { id: "character-design", name: "Character Design" },
            { id: "pixel-art", name: "Pixel Art" },
            { id: "nft-art", name: "NFT Art" },
            { id: "portraits", name: "Portraits & Avatars" },
        ]
    },
    {
        id: "3d-motion",
        name: "3D & Motion",
        icon: Boxes,
        subcategories: [
            { id: "3d-modeling", name: "3D Modeling" },
            { id: "3d-animation", name: "3D Animation" },
            { id: "motion-graphics", name: "Motion Graphics" },
            { id: "video-editing", name: "Video Editing" },
            { id: "vfx", name: "VFX & Compositing" },
            { id: "product-renders", name: "Product Renders" },
        ]
    },
    {
        id: "ai-automation",
        name: "AI & Automation",
        icon: Sparkles,
        subcategories: [
            { id: "ai-art-gen", name: "AI Art Generation" },
            { id: "chatbots", name: "Chatbots & Agents" },
            { id: "trading-bots", name: "Trading Bots" },
            { id: "data-automation", name: "Data Automation" },
            { id: "ai-integration", name: "AI Integration" },
        ]
    },
    {
        id: "design-branding",
        name: "Design & Branding",
        icon: PenTool,
        subcategories: [
            { id: "logo-design", name: "Logo Design" },
            { id: "brand-identity", name: "Brand Identity" },
            { id: "ui-ux-design", name: "UI/UX Design" },
            { id: "web-design", name: "Web Design" },
            { id: "social-media-design", name: "Social Media Design" },
            { id: "presentation-design", name: "Presentation Design" },
        ]
    },
    {
        id: "game-utility",
        name: "Game & Utility Dev",
        icon: Gamepad2,
        subcategories: [
            { id: "game-development", name: "Game Development" },
            { id: "discord-bots", name: "Discord Bots" },
            { id: "telegram-bots", name: "Telegram Bots" },
            { id: "browser-extensions", name: "Browser Extensions" },
            { id: "scripts-tools", name: "Scripts & Tools" },
        ]
    },
    {
        id: "marketing-community",
        name: "Marketing & Community",
        icon: Megaphone,
        subcategories: [
            { id: "community-management", name: "Community Management" },
            { id: "social-media-marketing", name: "Social Media Marketing" },
            { id: "influencer-marketing", name: "Influencer Marketing" },
            { id: "discord-setup", name: "Discord Setup" },
            { id: "content-creation", name: "Content Creation" },
            { id: "seo", name: "SEO & Growth" },
        ]
    },
    {
        id: "tokenomics-consulting",
        name: "Tokenomics & Consulting",
        icon: LineChart,
        subcategories: [
            { id: "tokenomics-design", name: "Tokenomics Design" },
            { id: "whitepaper", name: "Whitepaper Writing" },
            { id: "security-audit", name: "Security Audit" },
            { id: "project-consulting", name: "Project Consulting" },
            { id: "legal-compliance", name: "Legal & Compliance" },
        ]
    },
    {
        id: "web-app-dev",
        name: "Web & App Development",
        icon: Globe,
        subcategories: [
            { id: "frontend-dev", name: "Frontend Development" },
            { id: "backend-dev", name: "Backend Development" },
            { id: "fullstack-dev", name: "Full-Stack Development" },
            { id: "mobile-dev", name: "Mobile App Development" },
            { id: "api-integration", name: "API Integration" },
        ]
    },
    {
        id: "blockchain-web3",
        name: "Blockchain & Web3",
        icon: Code,
        subcategories: [
            { id: "smart-contracts", name: "Smart Contracts" },
            { id: "dapp-development", name: "dApp Development" },
            { id: "nft-marketplace", name: "NFT Marketplace" },
            { id: "defi-protocols", name: "DeFi Protocols" },
            { id: "wallet-integration", name: "Wallet Integration" },
            { id: "solana-pay", name: "Solana Pay Integration" },
        ]
    },
    {
        id: "writing-strategy",
        name: "Writing & Strategy",
        icon: FileText,
        subcategories: [
            { id: "copywriting", name: "Copywriting" },
            { id: "technical-writing", name: "Technical Writing" },
            { id: "blog-articles", name: "Blog & Articles" },
            { id: "pitch-decks", name: "Pitch Decks" },
            { id: "documentation", name: "Documentation" },
        ]
    },
]

// Price range filters
const PRICE_RANGES = [
    { id: "any", name: "Any Price", min: 0, max: Infinity },
    { id: "under-1", name: "Under 1 SOL", min: 0, max: 1 },
    { id: "1-5", name: "1-5 SOL", min: 1, max: 5 },
    { id: "5-10", name: "5-10 SOL", min: 5, max: 10 },
    { id: "10-25", name: "10-25 SOL", min: 10, max: 25 },
    { id: "25-plus", name: "25+ SOL", min: 25, max: Infinity },
]

// Updated mock data with hierarchical categories
const MOCK_SERVICES: Service[] = [
    {
        id: "1",
        freelancer_id: "f1",
        title: "I will build a professional Solana dApp with React & Anchor",
        description: "Full-stack Solana development including smart contracts, wallet integration, and beautiful UI. I specialize in DeFi protocols, NFT marketplaces, and custom blockchain solutions.",
        thumbnail_url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
        category: { id: 1, name: "Blockchain & Web3", slug: "blockchain-web3" },
        subcategory: "dapp-development",
        skills: [{ id: 1, name: "Solana" }, { id: 2, name: "Rust" }, { id: 3, name: "React" }, { id: 4, name: "Anchor" }],
        basic_price_sol: 2.5,
        standard_price_sol: 5,
        premium_price_sol: 12,
        basic_delivery_days: 7,
        standard_delivery_days: 14,
        premium_delivery_days: 21,
        status: "active",
        visibility: "public",
        average_rating: 4.9,
        total_reviews: 47,
        views_count: 1243,
        orders_count: 89,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-20T10:00:00Z",
        profile: { display_name: "Alex Chen", avatar_url: "https://i.pravatar.cc/150?u=alex" },
        freelancer: { id: "f1", username: "solana_dev", display_name: "Alex Chen" }
    },
    {
        id: "2",
        freelancer_id: "f2",
        title: "I will design a stunning Web3 landing page in Figma",
        description: "Modern, clean, and conversion-focused landing page designs for crypto projects, DeFi platforms, and NFT collections. Includes responsive designs and design system.",
        thumbnail_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
        category: { id: 2, name: "Design & Branding", slug: "design-branding" },
        subcategory: "web-design",
        skills: [{ id: 5, name: "Figma" }, { id: 6, name: "UI/UX" }, { id: 7, name: "Web Design" }],
        basic_price_sol: 1.5,
        standard_price_sol: 3,
        premium_price_sol: 6,
        basic_delivery_days: 3,
        standard_delivery_days: 5,
        premium_delivery_days: 7,
        status: "active",
        visibility: "public",
        average_rating: 5.0,
        total_reviews: 128,
        views_count: 2891,
        orders_count: 215,
        created_at: "2024-01-10T10:00:00Z",
        updated_at: "2024-01-18T10:00:00Z",
        profile: { display_name: "Sarah Kim", avatar_url: "https://i.pravatar.cc/150?u=sarah" },
        freelancer: { id: "f2", username: "pixel_perfect", display_name: "Sarah Kim" }
    },
    {
        id: "3",
        freelancer_id: "f3",
        title: "I will audit your Solana smart contract for security vulnerabilities",
        description: "Comprehensive security audit for Anchor/Rust programs. I'll identify vulnerabilities, provide detailed reports, and suggest fixes. Former security researcher at major DeFi protocol.",
        thumbnail_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
        category: { id: 3, name: "Tokenomics & Consulting", slug: "tokenomics-consulting" },
        subcategory: "security-audit",
        skills: [{ id: 1, name: "Solana" }, { id: 2, name: "Rust" }, { id: 8, name: "Security" }, { id: 9, name: "Audit" }],
        basic_price_sol: 8,
        standard_price_sol: 15,
        premium_price_sol: 30,
        basic_delivery_days: 5,
        standard_delivery_days: 10,
        premium_delivery_days: 14,
        status: "active",
        visibility: "public",
        average_rating: 5.0,
        total_reviews: 23,
        views_count: 567,
        orders_count: 31,
        created_at: "2024-01-12T10:00:00Z",
        updated_at: "2024-01-19T10:00:00Z",
        profile: { display_name: "Marcus Black", avatar_url: "https://i.pravatar.cc/150?u=marcus" },
        freelancer: { id: "f3", username: "security_guru", display_name: "Marcus Black" }
    },
    {
        id: "4",
        freelancer_id: "f4",
        title: "I will create custom NFT artwork and generative collections",
        description: "Unique digital art for your NFT project. I create hand-drawn illustrations, 3D renders, and generative art collections with trait variations. PFP collections my specialty.",
        thumbnail_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
        category: { id: 4, name: "Art & Illustration", slug: "art-illustration" },
        subcategory: "nft-art",
        skills: [{ id: 10, name: "NFT Art" }, { id: 11, name: "Illustration" }, { id: 12, name: "Generative Art" }],
        basic_price_sol: 0.8,
        standard_price_sol: 2,
        premium_price_sol: 8,
        basic_delivery_days: 2,
        standard_delivery_days: 5,
        premium_delivery_days: 14,
        status: "active",
        visibility: "public",
        average_rating: 4.8,
        total_reviews: 312,
        views_count: 4521,
        orders_count: 456,
        created_at: "2024-01-08T10:00:00Z",
        updated_at: "2024-01-17T10:00:00Z",
        profile: { display_name: "Luna Arts", avatar_url: "https://i.pravatar.cc/150?u=luna" },
        freelancer: { id: "f4", username: "nft_artist", display_name: "Luna Arts" }
    },
    {
        id: "5",
        freelancer_id: "f5",
        title: "I will build a responsive React frontend with TailwindCSS",
        description: "Pixel-perfect implementation of your designs. Expertise in React, Next.js, TypeScript, and modern CSS. Performance optimized and accessibility compliant.",
        thumbnail_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
        category: { id: 5, name: "Web & App Development", slug: "web-app-dev" },
        subcategory: "frontend-dev",
        skills: [{ id: 3, name: "React" }, { id: 13, name: "TypeScript" }, { id: 14, name: "TailwindCSS" }, { id: 15, name: "Next.js" }],
        basic_price_sol: 1.2,
        standard_price_sol: 2.5,
        premium_price_sol: 5,
        basic_delivery_days: 3,
        standard_delivery_days: 7,
        premium_delivery_days: 14,
        status: "active",
        visibility: "public",
        average_rating: 4.9,
        total_reviews: 89,
        views_count: 1876,
        orders_count: 134,
        created_at: "2024-01-14T10:00:00Z",
        updated_at: "2024-01-21T10:00:00Z",
        profile: { display_name: "Dev Master", avatar_url: "https://i.pravatar.cc/150?u=devmaster" },
        freelancer: { id: "f5", username: "react_ninja", display_name: "Dev Master" }
    },
    {
        id: "6",
        freelancer_id: "f6",
        title: "I will write engaging copy for your crypto project",
        description: "Compelling website copy, whitepaper content, and marketing materials for blockchain projects. I translate complex tech into engaging narratives that convert.",
        thumbnail_url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
        category: { id: 6, name: "Writing & Strategy", slug: "writing-strategy" },
        subcategory: "copywriting",
        skills: [{ id: 16, name: "Copywriting" }, { id: 17, name: "Content" }, { id: 18, name: "Marketing" }],
        basic_price_sol: 0.5,
        standard_price_sol: 1.2,
        premium_price_sol: 3,
        basic_delivery_days: 2,
        standard_delivery_days: 4,
        premium_delivery_days: 7,
        status: "active",
        visibility: "public",
        average_rating: 4.7,
        total_reviews: 156,
        views_count: 2134,
        orders_count: 198,
        created_at: "2024-01-11T10:00:00Z",
        updated_at: "2024-01-16T10:00:00Z",
        profile: { display_name: "Word Smith", avatar_url: "https://i.pravatar.cc/150?u=wordsmith" },
        freelancer: { id: "f6", username: "crypto_writer", display_name: "Word Smith" }
    },
    {
        id: "7",
        freelancer_id: "f7",
        title: "I will develop a Telegram trading bot for Solana tokens",
        description: "Custom Telegram bots for trading, sniping, and portfolio tracking on Solana. Integration with Jupiter, Raydium, and other DEXs. Fast execution and reliable uptime.",
        thumbnail_url: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=800&q=80",
        category: { id: 7, name: "AI & Automation", slug: "ai-automation" },
        subcategory: "trading-bots",
        skills: [{ id: 1, name: "Solana" }, { id: 19, name: "Python" }, { id: 20, name: "Trading Bot" }, { id: 21, name: "Telegram" }],
        basic_price_sol: 3,
        standard_price_sol: 6,
        premium_price_sol: 15,
        basic_delivery_days: 5,
        standard_delivery_days: 10,
        premium_delivery_days: 21,
        status: "active",
        visibility: "public",
        average_rating: 4.6,
        total_reviews: 34,
        views_count: 987,
        orders_count: 52,
        created_at: "2024-01-09T10:00:00Z",
        updated_at: "2024-01-18T10:00:00Z",
        profile: { display_name: "Bot Builder", avatar_url: "https://i.pravatar.cc/150?u=botbuilder" },
        freelancer: { id: "f7", username: "trading_bots", display_name: "Bot Builder" }
    },
    {
        id: "8",
        freelancer_id: "f8",
        title: "I will create a professional logo and brand identity",
        description: "Memorable logos and complete brand identity packages for Web3 projects. Includes logo variations, color palette, typography, and brand guidelines document.",
        thumbnail_url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80",
        category: { id: 8, name: "Design & Branding", slug: "design-branding" },
        subcategory: "logo-design",
        skills: [{ id: 22, name: "Logo Design" }, { id: 23, name: "Branding" }, { id: 24, name: "Identity" }],
        basic_price_sol: 0.6,
        standard_price_sol: 1.5,
        premium_price_sol: 4,
        basic_delivery_days: 2,
        standard_delivery_days: 4,
        premium_delivery_days: 7,
        status: "active",
        visibility: "public",
        average_rating: 4.9,
        total_reviews: 267,
        views_count: 3456,
        orders_count: 342,
        created_at: "2024-01-07T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
        profile: { display_name: "Brand Studio", avatar_url: "https://i.pravatar.cc/150?u=brandstudio" },
        freelancer: { id: "f8", username: "logo_master", display_name: "Brand Studio" }
    },
    {
        id: "9",
        freelancer_id: "f9",
        title: "I will set up and manage your Discord community server",
        description: "Complete Discord server setup with custom bots, roles, channels, and engagement strategies. Ongoing moderation and community management services available.",
        thumbnail_url: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&q=80",
        category: { id: 9, name: "Marketing & Community", slug: "marketing-community" },
        subcategory: "discord-setup",
        skills: [{ id: 25, name: "Discord" }, { id: 26, name: "Community" }, { id: 27, name: "Moderation" }],
        basic_price_sol: 0.4,
        standard_price_sol: 1,
        premium_price_sol: 2.5,
        basic_delivery_days: 1,
        standard_delivery_days: 3,
        premium_delivery_days: 7,
        status: "active",
        visibility: "public",
        average_rating: 4.8,
        total_reviews: 89,
        views_count: 1234,
        orders_count: 112,
        created_at: "2024-01-13T10:00:00Z",
        updated_at: "2024-01-20T10:00:00Z",
        profile: { display_name: "Community Pro", avatar_url: "https://i.pravatar.cc/150?u=communitypro" },
        freelancer: { id: "f9", username: "discord_mod", display_name: "Community Pro" }
    },
    {
        id: "10",
        freelancer_id: "f10",
        title: "I will build a complete NFT marketplace on Solana",
        description: "Full-featured NFT marketplace with minting, listing, bidding, and royalty support. Built with Metaplex standards. Includes admin dashboard and analytics.",
        thumbnail_url: "https://images.unsplash.com/photo-1642104704074-907c0698b98d?w=800&q=80",
        category: { id: 10, name: "Blockchain & Web3", slug: "blockchain-web3" },
        subcategory: "nft-marketplace",
        skills: [{ id: 1, name: "Solana" }, { id: 2, name: "Rust" }, { id: 3, name: "React" }, { id: 28, name: "Metaplex" }],
        basic_price_sol: 10,
        standard_price_sol: 25,
        premium_price_sol: 50,
        basic_delivery_days: 14,
        standard_delivery_days: 30,
        premium_delivery_days: 45,
        status: "active",
        visibility: "public",
        average_rating: 5.0,
        total_reviews: 12,
        views_count: 876,
        orders_count: 18,
        created_at: "2024-01-06T10:00:00Z",
        updated_at: "2024-01-14T10:00:00Z",
        profile: { display_name: "NFT Labs", avatar_url: "https://i.pravatar.cc/150?u=nftlabs" },
        freelancer: { id: "f10", username: "marketplace_dev", display_name: "NFT Labs" }
    },
    {
        id: "11",
        freelancer_id: "f11",
        title: "I will create animated explainer videos for your project",
        description: "Engaging motion graphics and animated videos that explain your product or protocol. Perfect for landing pages, social media, and investor presentations.",
        thumbnail_url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80",
        category: { id: 11, name: "3D & Motion", slug: "3d-motion" },
        subcategory: "motion-graphics",
        skills: [{ id: 29, name: "Motion Graphics" }, { id: 30, name: "After Effects" }, { id: 31, name: "Animation" }],
        basic_price_sol: 2,
        standard_price_sol: 4,
        premium_price_sol: 10,
        basic_delivery_days: 5,
        standard_delivery_days: 10,
        premium_delivery_days: 21,
        status: "active",
        visibility: "public",
        average_rating: 4.9,
        total_reviews: 67,
        views_count: 1567,
        orders_count: 89,
        created_at: "2024-01-10T10:00:00Z",
        updated_at: "2024-01-19T10:00:00Z",
        profile: { display_name: "Motion Studio", avatar_url: "https://i.pravatar.cc/150?u=motionstudio" },
        freelancer: { id: "f11", username: "animator_pro", display_name: "Motion Studio" }
    },
    {
        id: "12",
        freelancer_id: "f12",
        title: "I will integrate Solana Pay into your e-commerce store",
        description: "Seamless crypto payment integration for Shopify, WooCommerce, or custom stores. Support for SOL and SPL tokens with instant confirmations and low fees.",
        thumbnail_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
        category: { id: 12, name: "Blockchain & Web3", slug: "blockchain-web3" },
        subcategory: "solana-pay",
        skills: [{ id: 1, name: "Solana" }, { id: 32, name: "Solana Pay" }, { id: 33, name: "E-commerce" }],
        basic_price_sol: 1.5,
        standard_price_sol: 3,
        premium_price_sol: 6,
        basic_delivery_days: 3,
        standard_delivery_days: 5,
        premium_delivery_days: 10,
        status: "active",
        visibility: "public",
        average_rating: 4.7,
        total_reviews: 45,
        views_count: 789,
        orders_count: 67,
        created_at: "2024-01-05T10:00:00Z",
        updated_at: "2024-01-12T10:00:00Z",
        profile: { display_name: "Pay Dev", avatar_url: "https://i.pravatar.cc/150?u=paydev" },
        freelancer: { id: "f12", username: "payment_integrator", display_name: "Pay Dev" }
    },
    {
        id: "13",
        freelancer_id: "f13",
        title: "I will draw anime/manga style character illustrations",
        description: "Professional anime-style character designs, illustrations, and concept art. Perfect for VTubers, visual novels, games, and NFT projects. Full commercial rights included.",
        thumbnail_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
        category: { id: 13, name: "Art & Illustration", slug: "art-illustration" },
        subcategory: "anime-manga",
        skills: [{ id: 34, name: "Anime Art" }, { id: 35, name: "Character Design" }, { id: 11, name: "Illustration" }],
        basic_price_sol: 0.5,
        standard_price_sol: 1.5,
        premium_price_sol: 4,
        basic_delivery_days: 3,
        standard_delivery_days: 7,
        premium_delivery_days: 14,
        status: "active",
        visibility: "public",
        average_rating: 4.9,
        total_reviews: 234,
        views_count: 3421,
        orders_count: 312,
        created_at: "2024-01-04T10:00:00Z",
        updated_at: "2024-01-11T10:00:00Z",
        profile: { display_name: "Anime Studio", avatar_url: "https://i.pravatar.cc/150?u=animestudio" },
        freelancer: { id: "f13", username: "anime_artist", display_name: "Anime Studio" }
    },
    {
        id: "14",
        freelancer_id: "f14",
        title: "I will create stunning 3D product renders for your NFTs",
        description: "High-quality 3D renders and visualizations. Perfect for showcasing digital collectibles, metaverse assets, and product mockups. Multiple angles and lighting setups.",
        thumbnail_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
        category: { id: 14, name: "3D & Motion", slug: "3d-motion" },
        subcategory: "product-renders",
        skills: [{ id: 36, name: "Blender" }, { id: 37, name: "3D Rendering" }, { id: 38, name: "Product Visualization" }],
        basic_price_sol: 1,
        standard_price_sol: 2.5,
        premium_price_sol: 6,
        basic_delivery_days: 2,
        standard_delivery_days: 5,
        premium_delivery_days: 10,
        status: "active",
        visibility: "public",
        average_rating: 4.8,
        total_reviews: 89,
        views_count: 1456,
        orders_count: 123,
        created_at: "2024-01-03T10:00:00Z",
        updated_at: "2024-01-10T10:00:00Z",
        profile: { display_name: "3D Viz Pro", avatar_url: "https://i.pravatar.cc/150?u=3dvizpro" },
        freelancer: { id: "f14", username: "render_master", display_name: "3D Viz Pro" }
    },
    {
        id: "15",
        freelancer_id: "f15",
        title: "I will design your tokenomics and write a whitepaper",
        description: "Comprehensive tokenomics design including supply mechanics, distribution, vesting schedules, and utility. Professional whitepaper writing with clear explanations.",
        thumbnail_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
        category: { id: 15, name: "Tokenomics & Consulting", slug: "tokenomics-consulting" },
        subcategory: "tokenomics-design",
        skills: [{ id: 39, name: "Tokenomics" }, { id: 40, name: "Whitepaper" }, { id: 41, name: "Economics" }],
        basic_price_sol: 5,
        standard_price_sol: 12,
        premium_price_sol: 25,
        basic_delivery_days: 7,
        standard_delivery_days: 14,
        premium_delivery_days: 21,
        status: "active",
        visibility: "public",
        average_rating: 5.0,
        total_reviews: 34,
        views_count: 876,
        orders_count: 45,
        created_at: "2024-01-02T10:00:00Z",
        updated_at: "2024-01-09T10:00:00Z",
        profile: { display_name: "Token Architect", avatar_url: "https://i.pravatar.cc/150?u=tokenarch" },
        freelancer: { id: "f15", username: "tokenomics_expert", display_name: "Token Architect" }
    },
    {
        id: "16",
        freelancer_id: "f16",
        title: "I will build an AI chatbot for your Discord or Telegram",
        description: "Custom AI-powered chatbots using GPT-4, Claude, or open-source models. Perfect for community support, moderation, and engagement. Includes fine-tuning and custom personas.",
        thumbnail_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
        category: { id: 16, name: "AI & Automation", slug: "ai-automation" },
        subcategory: "chatbots",
        skills: [{ id: 42, name: "AI/ML" }, { id: 43, name: "Chatbots" }, { id: 19, name: "Python" }],
        basic_price_sol: 2,
        standard_price_sol: 5,
        premium_price_sol: 12,
        basic_delivery_days: 5,
        standard_delivery_days: 10,
        premium_delivery_days: 21,
        status: "active",
        visibility: "public",
        average_rating: 4.7,
        total_reviews: 56,
        views_count: 1234,
        orders_count: 78,
        created_at: "2024-01-01T10:00:00Z",
        updated_at: "2024-01-08T10:00:00Z",
        profile: { display_name: "AI Dev", avatar_url: "https://i.pravatar.cc/150?u=aidev" },
        freelancer: { id: "f16", username: "ai_builder", display_name: "AI Dev" }
    }
]

// Category Sidebar Component
function CategorySidebar({
    selectedCategory,
    selectedSubcategory,
    onCategorySelect,
    onSubcategorySelect,
    expandedCategories,
    onToggleCategory,
    isMobile = false,
    onClose
}: {
    selectedCategory: string | null
    selectedSubcategory: string | null
    onCategorySelect: (categoryId: string | null) => void
    onSubcategorySelect: (subcategoryId: string | null) => void
    expandedCategories: Set<string>
    onToggleCategory: (categoryId: string) => void
    isMobile?: boolean
    onClose?: () => void
}) {
    return (
        <div className={cn(
            "bg-[#0A0A0B] border-white/[0.06]",
            isMobile
                ? "fixed inset-0 z-50 p-6 overflow-auto"
                : "w-72 border-r min-h-screen sticky top-20"
        )}>
            {isMobile && (
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">Categories</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg bg-white/[0.05] text-zinc-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            <div className="p-4 space-y-1">
                {/* All Categories option */}
                <button
                    onClick={() => {
                        onCategorySelect(null)
                        onSubcategorySelect(null)
                        if (isMobile && onClose) onClose()
                    }}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                        !selectedCategory
                            ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                            : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                    )}
                >
                    <Package className="w-4 h-4" />
                    <span className="text-sm font-medium">All Categories</span>
                </button>

                {/* Category List */}
                {CATEGORY_HIERARCHY.map((category) => {
                    const Icon = category.icon
                    const isExpanded = expandedCategories.has(category.id)
                    const isSelected = selectedCategory === category.id

                    return (
                        <div key={category.id}>
                            <button
                                onClick={() => {
                                    // Toggle expand and also set the filter
                                    onToggleCategory(category.id)
                                    onCategorySelect(category.id)
                                    onSubcategorySelect(null)
                                    if (isMobile && onClose) onClose()
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                                    isSelected
                                        ? "bg-indigo-500/20 text-indigo-400"
                                        : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm font-medium flex-1">{category.name}</span>
                                <ChevronRight className={cn(
                                    "w-4 h-4 transition-transform",
                                    isExpanded && "rotate-90"
                                )} />
                            </button>

                            {/* Subcategories */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="ml-6 pl-3 mt-1 space-y-0.5 border-l border-white/[0.06]">
                                            {/* View All in Category */}
                                            <button
                                                onClick={() => {
                                                    onCategorySelect(category.id)
                                                    onSubcategorySelect(null)
                                                    if (isMobile && onClose) onClose()
                                                }}
                                                className={cn(
                                                    "w-full px-3 py-2 text-left text-xs font-medium rounded-lg transition-all",
                                                    selectedCategory === category.id && !selectedSubcategory
                                                        ? "bg-indigo-500/15 text-indigo-400"
                                                        : "text-zinc-500 hover:text-white hover:bg-white/[0.05]"
                                                )}
                                            >
                                                All {category.name}
                                            </button>

                                            {category.subcategories.map((sub) => (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => {
                                                        onCategorySelect(category.id)
                                                        onSubcategorySelect(sub.id)
                                                        if (isMobile && onClose) onClose()
                                                    }}
                                                    className={cn(
                                                        "w-full px-3 py-2 text-left text-xs rounded-lg transition-all",
                                                        selectedSubcategory === sub.id
                                                            ? "bg-indigo-500/15 text-indigo-400"
                                                            : "text-zinc-500 hover:text-white hover:bg-white/[0.05]"
                                                    )}
                                                >
                                                    {sub.name}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export function Services() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
    const [selectedPriceRange, setSelectedPriceRange] = useState<string>("any")
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
    const [showMobileSidebar, setShowMobileSidebar] = useState(false)

    // Quick category filters (top pills)
    const quickCategories = CATEGORY_HIERARCHY.slice(0, 5)

    const toggleCategory = (categoryId: string) => {
        const newExpanded = new Set(expandedCategories)
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId)
        } else {
            newExpanded.add(categoryId)
        }
        setExpandedCategories(newExpanded)
    }

    const getLowestPrice = (service: Service) => {
        const prices = [
            service.basic_price_sol,
            service.standard_price_sol,
            service.premium_price_sol
        ].filter(p => p != null && p > 0) as number[]
        return prices.length > 0 ? Math.min(...prices) : null
    }

    // Apply all filters to a list of services
    const applyFilters = (serviceList: Service[]): Service[] => {
        let filtered = [...serviceList]

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(s =>
                s.title.toLowerCase().includes(query) ||
                s.description?.toLowerCase().includes(query) ||
                s.skills?.some(sk => sk.name.toLowerCase().includes(query))
            )
        }

        // Apply category filter
        if (selectedCategory) {
            filtered = filtered.filter(s => s.category?.slug === selectedCategory)
        }

        // Apply subcategory filter
        if (selectedSubcategory) {
            filtered = filtered.filter(s => s.subcategory === selectedSubcategory)
        }

        // Apply price filter
        const priceRange = PRICE_RANGES.find(p => p.id === selectedPriceRange)
        if (priceRange && priceRange.id !== "any") {
            filtered = filtered.filter(s => {
                const lowestPrice = getLowestPrice(s)
                if (lowestPrice === null) return false
                return lowestPrice >= priceRange.min && lowestPrice < priceRange.max
            })
        }

        return filtered
    }

    useEffect(() => {
        loadServices()
    }, [searchQuery, selectedCategory, selectedSubcategory, selectedPriceRange])

    const loadServices = async () => {
        setLoading(true)
        try {
            const data = await ServiceAPI.search({
                q: searchQuery || undefined,
                limit: 50
            })

            let sourceData: Service[] = []

            // Use real data if available, otherwise fallback to mock
            if (data.services && data.services.length > 0) {
                sourceData = data.services
            } else {
                sourceData = MOCK_SERVICES
            }

            // Apply all filters
            const filtered = applyFilters(sourceData)
            setServices(filtered)
        } catch (error) {
            console.error("Failed to load services:", error)
            // Apply filters to mock data on error as well
            const filtered = applyFilters(MOCK_SERVICES)
            setServices(filtered)
        } finally {
            setLoading(false)
        }
    }

    const getDeliveryDays = (service: Service) => {
        const days = [
            service.basic_delivery_days,
            service.standard_delivery_days,
            service.premium_delivery_days
        ].filter(d => d != null && d > 0) as number[]
        return days.length > 0 ? Math.min(...days) : null
    }

    const getActiveFiltersCount = () => {
        let count = 0
        if (selectedCategory) count++
        if (selectedSubcategory) count++
        if (selectedPriceRange !== "any") count++
        return count
    }

    const clearAllFilters = () => {
        setSelectedCategory(null)
        setSelectedSubcategory(null)
        setSelectedPriceRange("any")
        setSearchQuery("")
    }

    return (
        <div className="min-h-screen bg-[#0A0A0B]">
            {/* Header */}
            <div className="bg-gradient-to-b from-indigo-900/20 to-transparent pt-24 border-b border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-6"
                    >
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                            Browse Gigs
                        </h1>
                        <p className="text-base text-zinc-400 max-w-2xl mx-auto">
                            Discover quality work from talented creators. Judge by the work, not the face.
                        </p>
                    </motion.div>

                    {/* Search */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-2xl mx-auto mb-6"
                    >
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search gigs by skill, title, or keyword..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 bg-white/[0.03] border border-white/[0.08] rounded-xl pl-12 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                            />
                        </div>
                    </motion.div>

                    {/* Quick Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="flex flex-wrap items-center justify-center gap-2 mb-4"
                    >
                        {/* Category Pills */}
                        <button
                            onClick={() => {
                                setSelectedCategory(null)
                                setSelectedSubcategory(null)
                            }}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                                !selectedCategory
                                    ? "bg-white text-black"
                                    : "bg-white/[0.03] text-zinc-400 border border-white/[0.06] hover:border-white/15 hover:text-white"
                            )}
                        >
                            All
                        </button>
                        {quickCategories.map((cat) => {
                            const Icon = cat.icon
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setSelectedCategory(cat.id)
                                        setSelectedSubcategory(null)
                                    }}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                                        selectedCategory === cat.id
                                            ? "bg-white text-black"
                                            : "bg-white/[0.03] text-zinc-400 border border-white/[0.06] hover:border-white/15 hover:text-white"
                                    )}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {cat.name}
                                </button>
                            )
                        })}
                    </motion.div>

                    {/* Price Range Pills */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap items-center justify-center gap-2"
                    >
                        {PRICE_RANGES.map((range) => (
                            <button
                                key={range.id}
                                onClick={() => setSelectedPriceRange(range.id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                    selectedPriceRange === range.id
                                        ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                                        : "bg-white/[0.02] text-zinc-500 border border-white/[0.04] hover:border-white/10 hover:text-zinc-300"
                                )}
                            >
                                {range.name}
                            </button>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Main Content with Sidebar */}
            <div className="flex">
                {/* Desktop Sidebar */}
                <div className="hidden lg:block">
                    <CategorySidebar
                        selectedCategory={selectedCategory}
                        selectedSubcategory={selectedSubcategory}
                        onCategorySelect={setSelectedCategory}
                        onSubcategorySelect={setSelectedSubcategory}
                        expandedCategories={expandedCategories}
                        onToggleCategory={toggleCategory}
                    />
                </div>

                {/* Mobile Sidebar */}
                <AnimatePresence>
                    {showMobileSidebar && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <CategorySidebar
                                selectedCategory={selectedCategory}
                                selectedSubcategory={selectedSubcategory}
                                onCategorySelect={setSelectedCategory}
                                onSubcategorySelect={setSelectedSubcategory}
                                expandedCategories={expandedCategories}
                                onToggleCategory={toggleCategory}
                                isMobile
                                onClose={() => setShowMobileSidebar(false)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Content Area */}
                <div className="flex-1 min-w-0 px-6 py-6">
                    {/* Results Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            {/* Mobile Category Toggle */}
                            <button
                                onClick={() => setShowMobileSidebar(true)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-white transition-colors"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                <span className="text-sm">Filters</span>
                                {getActiveFiltersCount() > 0 && (
                                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center">
                                        {getActiveFiltersCount()}
                                    </span>
                                )}
                            </button>

                            {!loading && (
                                <span className="text-sm text-zinc-500">
                                    {services.length} gig{services.length !== 1 ? 's' : ''} found
                                </span>
                            )}
                        </div>

                        {/* Active Filters & Clear */}
                        {getActiveFiltersCount() > 0 && (
                            <button
                                onClick={clearAllFilters}
                                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>

                    {/* Active Filter Tags */}
                    {(selectedCategory || selectedSubcategory || selectedPriceRange !== "any") && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {selectedCategory && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm">
                                    {CATEGORY_HIERARCHY.find(c => c.id === selectedCategory)?.name}
                                    <button
                                        onClick={() => {
                                            setSelectedCategory(null)
                                            setSelectedSubcategory(null)
                                        }}
                                        className="hover:text-white"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </span>
                            )}
                            {selectedSubcategory && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm">
                                    {CATEGORY_HIERARCHY
                                        .flatMap(c => c.subcategories)
                                        .find(s => s.id === selectedSubcategory)?.name}
                                    <button
                                        onClick={() => setSelectedSubcategory(null)}
                                        className="hover:text-white"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </span>
                            )}
                            {selectedPriceRange !== "any" && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                                    {PRICE_RANGES.find(p => p.id === selectedPriceRange)?.name}
                                    <button
                                        onClick={() => setSelectedPriceRange("any")}
                                        className="hover:text-white"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}

                    {/* Results */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
                        </div>
                    ) : services.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-zinc-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                No gigs found
                            </h3>
                            <p className="text-zinc-500 max-w-md mx-auto mb-4">
                                Try adjusting your filters or search term
                            </p>
                            <button
                                onClick={clearAllFilters}
                                className="px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
                            >
                                Clear all filters
                            </button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                            {services.map((service, i) => {
                                const lowestPrice = getLowestPrice(service)
                                const fastestDelivery = getDeliveryDays(service)
                                const tags = service.skills?.map(s => s.name) || []

                                return (
                                    <motion.div
                                        key={service.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                    >
                                        <Link to={`/services/${service.id}`}>
                                            <div className="group rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all">
                                                {/* Cover Image */}
                                                <div className="aspect-[4/3] bg-gradient-to-br from-indigo-500/20 to-violet-500/20 relative overflow-hidden">
                                                    {service.thumbnail_url ? (
                                                        <img
                                                            src={service.thumbnail_url}
                                                            alt={service.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="w-16 h-16 text-white/10" />
                                                        </div>
                                                    )}

                                                    {/* Category Badge */}
                                                    {service.category && (
                                                        <div className="absolute top-3 left-3">
                                                            <span className="px-2.5 py-1 text-xs font-medium bg-black/60 backdrop-blur-sm text-white rounded-lg border border-white/10">
                                                                {service.category.name}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* View Count */}
                                                    <div className="absolute top-3 right-3">
                                                        <span className="flex items-center gap-1 px-2 py-1 text-xs bg-black/60 backdrop-blur-sm text-white rounded-lg border border-white/10">
                                                            <Eye className="w-3 h-3" />
                                                            {service.views_count || 0}
                                                        </span>
                                                    </div>

                                                    {/* Rating */}
                                                    {service.average_rating > 0 && (
                                                        <div className="absolute bottom-3 left-3">
                                                            <span className="flex items-center gap-1 px-2 py-1 text-xs bg-black/60 backdrop-blur-sm text-white rounded-lg border border-white/10">
                                                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                                {service.average_rating.toFixed(1)}
                                                                <span className="text-zinc-400">({service.total_reviews})</span>
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="p-4">
                                                    {/* Title */}
                                                    <h3 className="font-semibold text-white line-clamp-2 group-hover:text-indigo-400 transition-colors mb-2 text-[15px] leading-snug">
                                                        {service.title}
                                                    </h3>

                                                    {/* Description */}
                                                    {service.description && (
                                                        <p className="text-xs text-zinc-500 line-clamp-2 mb-3">
                                                            {service.description}
                                                        </p>
                                                    )}

                                                    {/* Tags */}
                                                    {tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                                            {tags.slice(0, 3).map((tag: string, idx: number) => (
                                                                <span
                                                                    key={idx}
                                                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] bg-white/[0.05] text-zinc-400 rounded-md border border-white/[0.06]"
                                                                >
                                                                    <Tag className="w-2.5 h-2.5" />
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                            {tags.length > 3 && (
                                                                <span className="text-[10px] text-zinc-600">+{tags.length - 3}</span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Footer */}
                                                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                                                        <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                                                            {fastestDelivery && (
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {fastestDelivery}d
                                                                </span>
                                                            )}
                                                            {(service.orders_count ?? 0) > 0 && (
                                                                <span className="flex items-center gap-1">
                                                                    <ShoppingBag className="w-3 h-3" />
                                                                    {service.orders_count}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {lowestPrice ? (
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-[10px] text-zinc-500">From</span>
                                                                <span className="font-bold text-indigo-400">
                                                                    {lowestPrice} SOL
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-zinc-500">Contact</span>
                                                        )}
                                                    </div>

                                                    {/* Seller Info */}
                                                    <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                            {service.profile?.avatar_url ? (
                                                                <img
                                                                    src={service.profile.avatar_url}
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-[8px] font-bold text-zinc-400">
                                                                    {(service.profile?.display_name || 'A')[0].toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[11px] text-zinc-600 truncate">
                                                            @{service.freelancer?.username || 'creator'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
