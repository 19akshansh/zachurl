"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; 
import {
  Link2,
  QrCode,
  ClipboardPaste,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  MousePointer2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LandingPage() {
  const [url, setUrl] = React.useState(""); 
  const router = useRouter();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      toast.success("URL pasted from clipboard");
    } catch (err) {
      toast.error("Failed to read clipboard. Please paste manually.");
    }
  };

  const handleShorten = () => {
    if (!url) {
      toast.error("Please enter a URL first");
      return;
    }
    router.push(`/signin?url=${encodeURIComponent(url)}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
        <Link2 className="absolute top-[15%] left-[10%] size-12 -rotate-12" />
        <QrCode className="absolute top-[20%] right-[15%] size-10 rotate-12" />
        <ShieldCheck className="absolute bottom-[20%] left-[15%] size-12 -rotate-12" />
        <MousePointer2 className="absolute bottom-[30%] right-[10%] size-8 rotate-12" />
        <Globe className="absolute top-[40%] left-[5%] size-10" />
        <Zap className="absolute top-[10%] right-[30%] size-6" />
      </div>

      <nav className="relative z-10 border-b border-border bg-background/50 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-primary rounded-md flex items-center justify-center">
              <Link2 className="size-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tighter">ZachURL</span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex font-bold"
              asChild
            >
              <Link href="/signin">Sign In</Link>
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground font-bold rounded-md shadow-sm px-5"
              asChild
            >
              <Link href="/signin">Start Free</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 pt-20 pb-32 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
          <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-tight">
            Transform your <span className="text-primary">long links</span> into{" "}
            <br />
            powerful URLs
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Shorten, customize and track your links with advanced analytics. The
            complete solution to manage your digital campaigns.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border p-6 md:p-10 rounded-2xl shadow-2xl">
            <div className="flex flex-col md:flex-row gap-3 mb-8">
              <div className="relative flex-1 group">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)} 
                  onKeyDown={(e) => e.key === "Enter" && handleShorten()} 
                  placeholder="Paste your URL here... (e.g. https://mysite.com/very-long-link)"
                  className="h-14 bg-background border-border rounded-xl px-5 text-base focus-visible:ring-primary/20"
                />
                <Button
                  onClick={handlePaste} 
                  variant="secondary"
                  size="sm"
                  className="absolute right-2 top-2 h-10 border border-border gap-2 font-bold bg-muted/50"
                >
                  <ClipboardPaste className="size-4" /> Paste
                </Button>
              </div>
              <Button 
                onClick={handleShorten}
                className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg rounded-xl shadow-lg transition-transform active:scale-95"
              >
                <Zap className="mr-2 size-5 fill-current" /> Shorten Now
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <FeatureButton icon={<Link2 />} label="Custom Link" />
              <FeatureButton icon={<QrCode />} label="Generate QR Code" />
            </div>
          </div>

          <div className="mt-16 text-center space-y-8">
            <p className="text-muted-foreground text-sm font-medium">
              Join thousands of professionals who trust ZachURL
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="h-14 px-10 rounded-xl bg-primary text-primary-foreground font-black text-lg group shadow-xl"
                asChild
              >
                <Link href="/signin">
                  Start Free{" "}
                  <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-6 pt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              <div className="flex items-center gap-2">
                <Zap className="size-3 text-primary" /> No credit card
              </div>
              <div className="flex items-center gap-2">
                <Zap className="size-3 text-primary" /> 30-second setup
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-3 text-primary" /> 100% Secure
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-10 border-t border-border text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          © 2026 ZachURL
        </p>
      </footer>
    </div>
  );
}

function FeatureButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-all group">
      <div className="size-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
        {React.isValidElement(icon)
          ? React.cloneElement(
              icon as React.ReactElement<{ className?: string }>,
              {
                className: "size-5",
              },
            )
          : icon}
      </div>
      <span className="text-[11px] font-black uppercase tracking-tight text-foreground/80">
        {label}
      </span>
    </button>
  );
}