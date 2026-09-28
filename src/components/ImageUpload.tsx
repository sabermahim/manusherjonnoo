import React, { useRef, useState } from 'react';
import { AlertCircle, CheckCircle, Image as ImageIcon, Trash2, UploadCloud } from 'lucide-react';
import { api } from '../lib/api.ts';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, className = '' }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setError(null);

    // Validate type: JPG, JPEG, PNG, WEBP
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('শুধুমাত্র JPG, JPEG, PNG ও WEBP ফরম্যাটের ছবি গ্রহণযোগ্য।');
      return;
    }

    // Validate size: 5MB maximum
    if (file.size > 5 * 1024 * 1024) {
      setError('ছবির আকার সর্বোচ্চ ৫ মেগাবাইট (5MB) হতে পারে।');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        try {
          const res = await api.uploadImage(base64Data, file.name);
          onChange(res.url);
        } catch (err: any) {
          setError(err.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে।');
        } finally {
          setUploading(false);
        }
      };
      reader.onerror = () => {
        setError('ফাইল পড়তে ত্রুটি হয়েছে।');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (e: any) {
      setError('ছবি প্রসেসিংয়ে সমস্যা হয়েছে।');
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={`space-y-2 font-bengali ${className}`}>
      <label className="block text-xs font-bold text-slate-700">
        প্রাসঙ্গিক ছবি (ঐচ্ছিক)
      </label>

      {/* Safety Warning */}
      <div className="p-2.5 bg-amber-50 border border-amber-200/90 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          <strong>সতর্কতা:</strong> ব্যক্তির প্রয়োজনের সঙ্গে সম্পর্কিত প্রয়োজনীয় ছবি ছাড়া ব্যক্তিগত
          বা সংবেদনশীল তথ্য (যেমন: জাতীয় পরিচয়পত্র, বাসার সুনির্দিষ্ট ঠিকানা, রোগীর গোপন তথ্য) আপলোড করবেন না।
        </span>
      </div>

      {/* Upload Box */}
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/30 group bg-slate-100 max-h-56 flex items-center justify-center">
          <img
            src={value}
            alt="Uploaded Preview"
            className="w-full h-48 object-cover rounded-xl"
          />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRemove}
              className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>ছবি মুছে ফেলুন</span>
            </button>
          </div>
          <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-emerald-700/80 text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> ছবি সংযুক্ত
          </span>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50/60'
              : 'border-slate-300 bg-slate-50 hover:bg-slate-100/70 hover:border-emerald-400'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
            {uploading ? (
              <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-800">
              ছবি এখানে Drag & Drop করুন
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              অথবা <span className="text-emerald-600 font-bold underline">ছবি নির্বাচন করুন</span>
            </p>
          </div>

          <p className="text-[11px] text-slate-400">
            JPG, JPEG, PNG, WEBP (সর্বোচ্চ ৫ মেগাবাইট)
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
