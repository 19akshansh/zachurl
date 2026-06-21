"use client";

import React, { useState, useRef } from "react";
import { useUpdateQr, useResetQrStyles } from "../hooks/useQrs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ImageIcon,
  Palette,
  RefreshCcw,
  Save,
  Download,
  ArrowLeftRight,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

interface QrEditorProps {
  urlId: string;
  shortUrl: string;
  initialData: {
    fgColor: string;
    bgColor: string;
    logoUrl?: string | null;
  };
}

export const QrCodeEditor = ({ urlId, shortUrl, initialData }: QrEditorProps) => {
  const [fgColor, setFgColor] = useState(initialData.fgColor);
  const [bgColor, setBgColor] = useState(initialData.bgColor);
  const [logoUrl, setLogoUrl] = useState(initialData.logoUrl || "");

  const qrRef = useRef<SVGSVGElement>(null);
  const updateQr = useUpdateQr();
  const resetQr = useResetQrStyles();

  const handleSave = () => {
    updateQr.mutate({ urlId, fgColor, bgColor, logoUrl });
  };

  const handleSwapColors = () => {
    const oldFg = fgColor;
    setFgColor(bgColor);
    setBgColor(oldFg);
  };

  const handleReset = () => {
    resetQr.mutate(
      { urlId },
      {
        onSuccess: (data) => {
          setFgColor(data.fgColor);
          setBgColor(data.bgColor);
          setLogoUrl("");
        },
      },
    );
  };

  const downloadQr = () => {
    if (!qrRef.current) return;

    const svgData = qrRef.current.outerHTML;
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });

    const svgUrl = URL.createObjectURL(svgBlob);

    try {
      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = `qr-code-${urlId}.svg`;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      toast.success("QR Code downloaded as SVG");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download QR code");
    } finally {
      setTimeout(() => {
        URL.revokeObjectURL(svgUrl);
      }, 100);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl">
      <div
        className="flex flex-col items-center justify-center border rounded-2xl p-10 shadow-sm ring-1 ring-black/5 transition-colors duration-300"
        style={{ backgroundColor: bgColor }}
      >
        <div className="p-4 rounded-lg">
          <QRCodeSVG
            ref={qrRef}
            value={shortUrl}
            size={240}
            fgColor={fgColor}
            bgColor={bgColor}
            level="H"
            imageSettings={
              logoUrl
                ? {
                    src: logoUrl,
                    height: 48,
                    width: 48,
                    excavate: false,
                  }
                : undefined
            }
          />
        </div>

        <div className="mt-6 flex flex-col items-center gap-2">
          <p
            className="text-[10px] uppercase tracking-widest font-bold"
            style={{ color: fgColor }}
          >
            Dynamic Live Preview
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8"
            style={{ color: fgColor }}
            onClick={downloadQr}
          >
            <Download className="size-3 mr-2" />
            Download SVG
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Palette className="size-4" /> Colors
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSwapColors}
              className="h-7 text-[10px]"
            >
              <ArrowLeftRight className="size-3 mr-1" /> Swap
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground">
                Dots (Foreground)
              </Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="font-mono text-xs uppercase"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground">
                Space (Background)
              </Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="font-mono text-xs uppercase"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-2 font-semibold text-sm border-b pb-2">
              <ImageIcon className="size-4" /> Logo Overlay
            </div>
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground">Logo URL</Label>
              <Input
                placeholder="https://..."
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={updateQr.isPending}
          >
            {updateQr.isPending ? (
              <RefreshCcw className="size-4 animate-spin mr-2" />
            ) : (
              <Save className="size-4 mr-2" />
            )}
            Save Design
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={resetQr.isPending}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};;
