import { useCallback, useState } from "react";

import { FileUp, Upload, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { importWishlist } from "@/services/db/wishlist-operations";
import type { ParsedWishlist } from "@/services/wishlist";
import { createWishlistFromParsed, parseWishlistFile } from "@/services/wishlist";
import type { Wishlist } from "@/types/wishlist";

interface ImportWishlistProps {
  onImported?: (wishlist: Wishlist) => void;
}

export function ImportWishlist({ onImported }: ImportWishlistProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedWishlist | null>(null);

  const resetState = () => {
    setFile(null);
    setCustomName("");
    setParsedData(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetState();
    }
  };

  const handleFile = async (fileToProcess: File) => {
    if (!fileToProcess.name.endsWith(".json")) {
      toast.error("Invalid file type", {
        description: "Please select a JSON file.",
      });
      return;
    }

    const content = await fileToProcess.text();
    const parsed = parseWishlistFile(content);

    if (!parsed) {
      toast.error("Invalid wishlist file", {
        description: "The file could not be parsed as a valid wishlist.",
      });
      return;
    }

    setFile(fileToProcess);
    setParsedData(parsed);
    setCustomName(parsed.name);
  };

  const onDrop = useCallback((acceptedFiles: Array<File>) => {
    if (acceptedFiles.length > 0) {
      handleFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/json": [".json"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleImport = async () => {
    if (!parsedData) return;

    setIsImporting(true);
    try {
      const wishlistToImport = createWishlistFromParsed(parsedData);
      const imported = await importWishlist(wishlistToImport, customName.trim() || undefined);

      toast.success("Wishlist imported", {
        description: `"${imported.name}" has been imported successfully.`,
      });

      handleOpenChange(false);
      onImported?.(imported);
    } catch (error) {
      toast.error("Import failed", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <Upload className="size-4" />
            Import
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Wishlist</DialogTitle>
          <DialogDescription>
            Import a wishlist from a JSON file. Drag and drop or click to select.
          </DialogDescription>
        </DialogHeader>

        {!file ? (
          <div
            {...getRootProps()}
            className={cn(
              "relative flex h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            )}
          >
            <input {...getInputProps()} />
            <FileUp
              className={cn("size-10", isDragActive ? "text-primary" : "text-muted-foreground")}
            />
            <div className="text-center">
              <p className="text-sm font-medium">
                {isDragActive ? "Drop file here" : "Drag & drop a JSON file"}
              </p>
              <p className="text-muted-foreground text-xs">or click to browse</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted flex items-center justify-between gap-3 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <FileUp className="text-muted-foreground size-5" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  {parsedData && (
                    <p className="text-muted-foreground text-xs">
                      {parsedData.weaponCount} weapons, {parsedData.rollCount} rolls
                    </p>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={resetState}>
                <X className="size-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="import-name">Wishlist Name</Label>
              <Input
                id="import-name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter a name for the imported wishlist"
              />
              <p className="text-muted-foreground text-xs">
                Leave empty to use the original name with "(imported)" suffix.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || isImporting}>
            {isImporting ? "Importing..." : "Import Wishlist"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
