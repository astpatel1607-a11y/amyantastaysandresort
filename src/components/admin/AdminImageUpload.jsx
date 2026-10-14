import React, { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";

// value: string[] (array of public URLs). onChange(string[]).
export default function AdminImageUpload({ value = [], onChange, label = "Images", multiple = true }) {
  const [uploading, setUploading] = useState(false);
  const list = Array.isArray(value) ? value : value ? [value] : [];

  const handleFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
        urls.push(file_url);
      }
      onChange(multiple ? [...list, ...urls] : urls[0]);
    } catch (e) {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const remove = (i) => onChange(multiple ? list.filter((_, idx) => idx !== i) : "");

  return (
    <div>
      <div className="text-sm font-medium mb-2">{label}</div>
      <div className="flex flex-wrap gap-3 mb-3">
        {list.map((url, i) => (
          <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-juniper/10 group">
            <Image src={url} fittingType="fill" alt="" className="w-full h-full" />
            <button type="button" onClick={() => remove(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-juniper/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <label className="w-24 h-24 rounded-lg border-2 border-dashed border-juniper/20 flex flex-col items-center justify-center cursor-pointer hover:border-ochre hover:bg-ochre/5 transition-colors text-juniper/50">
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Upload className="w-5 h-5" /><span className="text-[10px] mt-1">Upload</span></>}
          <input type="file" accept="image/*" multiple={multiple} className="hidden" onChange={(e) => handleFiles(Array.from(e.target.files))} />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">Images are stored publicly so they load on the live site.</p>
    </div>
  );
}