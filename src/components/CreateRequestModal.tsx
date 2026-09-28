import React, { useState } from 'react';
import { api } from '../lib/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  Languages,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { InteractiveMap } from './InteractiveMap.tsx';
import { ImageUpload } from './ImageUpload.tsx';

interface CreateRequestModalProps {
  onClose: () => void;
  onSuccess: (newId: number) => void;
  onOpenLogin: () => void;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  onClose,
  onSuccess,
  onOpenLogin,
}) => {
  const { user } = useAuth();
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  const [category, setCategory] = useState('শিক্ষা সহায়তা');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryAge, setBeneficiaryAge] = useState('');
  const [locationName, setLocationName] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 23.807,
    lng: 90.368,
  });
  const [urgency, setUrgency] = useState<'স্বাভাবিক' | 'মাঝারি' | 'জরুরি'>('স্বাভাবিক');
  const [requiredAssistance, setRequiredAssistance] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [volunteerNeeded, setVolunteerNeeded] = useState(false);

  // Education specific fields
  const [eduLevel, setEduLevel] = useState('');
  const [eduMaterials, setEduMaterials] = useState('');
  const [eduSchool, setEduSchool] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sample quick images
  const sampleImages = [
    { labelBn: 'শিক্ষা', labelEn: 'Education', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80' },
    { labelBn: 'খাবার', labelEn: 'Food', url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80' },
    { labelBn: 'পোশাক', labelEn: 'Clothing', url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80' },
    { labelBn: 'চিকিৎসা', labelEn: 'Medical', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenLogin();
      return;
    }

    if (!title.trim() || !description.trim() || !requiredAssistance.trim()) {
      setError(
        lang === 'bn'
          ? 'অনুগ্রহ করে শিরোনাম, বিবরণ এবং প্রয়োজনীয় সহযোগিতার ঘর পূরণ করুন।'
          : 'Please fill in the title, description, and required assistance fields.'
      );
      return;
    }

    setLoading(true);
    setError('');

    const educationDetails =
      category === 'শিক্ষা সহায়তা'
        ? {
            level: eduLevel,
            age: beneficiaryAge,
            neededMaterials: eduMaterials,
            school: eduSchool,
          }
        : undefined;

    try {
      const res = await api.createRequest({
        category,
        title,
        description,
        beneficiaryName,
        beneficiaryAge,
        approxLat: coords.lat,
        approxLng: coords.lng,
        locationName: locationName.trim() || (lang === 'bn' ? 'ঢাকা' : 'Dhaka'),
        urgency,
        requiredAssistance,
        additionalInfo,
        educationDetails,
        imageUrl,
        volunteerNeeded,
      });

      onSuccess(res.request.id);
    } catch (err: any) {
      setError(err.message || (lang === 'bn' ? 'আবেদন জমা দিতে সমস্যা হয়েছে।' : 'Failed to submit request.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-emerald-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5" />
            <h2 className="font-extrabold text-base sm:text-lg">
              {lang === 'bn' ? 'সহায়তার আবেদন করুন' : 'Submit Assistance Request'}
            </h2>
          </div>
          
          <div className="flex items-center gap-2.5">
            {/* Language Switcher */}
            <div className="flex items-center bg-emerald-700/80 p-0.5 rounded-xl border border-emerald-500/60 text-xs">
              <button
                type="button"
                onClick={() => setLang('bn')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                  lang === 'bn' ? 'bg-white text-emerald-900 shadow-xs font-bold' : 'text-emerald-100 hover:text-white'
                }`}
                title="বাংলায় দেখুন"
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                  lang === 'en' ? 'bg-white text-emerald-900 shadow-xs font-bold' : 'text-emerald-100 hover:text-white'
                }`}
                title="Switch to English"
              >
                English
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-emerald-700/60 rounded-xl transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Language note & English typing support notice */}
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3.5 py-2.5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium text-slate-800">
                {lang === 'bn'
                  ? 'আপনি যেকোনো ঘরে বাংলা অথবা ইংরেজিতে (English) লিখতে পারেন।'
                  : 'You can write in English or Bengali (বাংলা) in all fields.'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <Languages className="w-3 h-3" />
              <span>{lang === 'bn' ? 'English / বাংলা' : 'Bilingual'}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>{lang === 'bn' ? 'গোপনীয়তা সতর্কতা:' : 'Privacy Notice:'}</strong>{' '}
              {lang === 'bn'
                ? 'অনুগ্রহ করে ব্যক্তির অনুমতি ছাড়া সংবেদনশীল তথ্য বা নির্দিষ্ট ব্যক্তিগত ফোন নম্বর বা বাড়ির সঠিক ঠিকানা উন্মুক্ত করবেন না। ভৌগোলিক নিরাপত্তার স্বার্থে শুধুমাত্র এলাকার আনুমানিক নাম ব্যবহার করুন।'
                : 'Please do not disclose sensitive personal information without permission. For security, only specify approximate area name.'}
            </div>
          </div>

          {/* Category & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {lang === 'bn' ? 'সহায়তার ক্যাটাগরি *' : 'Assistance Category *'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              >
                <option value="শিক্ষা সহায়তা">{lang === 'bn' ? 'শিক্ষা সহায়তা' : 'Education Support (শিক্ষা সহায়তা)'}</option>
                <option value="খাবার">{lang === 'bn' ? 'খাবার' : 'Food (খাবার)'}</option>
                <option value="পোশাক">{lang === 'bn' ? 'পোশাক' : 'Clothing (পোশাক)'}</option>
                <option value="চিকিৎসা সহায়তা">{lang === 'bn' ? 'চিকিৎসা সহায়তা' : 'Medical Assistance (চিকিৎসা সহায়তা)'}</option>
                <option value="জরুরি সহায়তা">{lang === 'bn' ? 'জরুরি সহায়তা' : 'Emergency Relief (জরুরি সহায়তা)'}</option>
                <option value="বাসস্থান সহায়তা">{lang === 'bn' ? 'বাসস্থান সহায়তা' : 'Shelter Support (বাসস্থান সহায়তা)'}</option>
                <option value="দৈনন্দিন প্রয়োজন">{lang === 'bn' ? 'দৈনন্দিন প্রয়োজন' : 'Daily Essentials (দৈনন্দিন প্রয়োজন)'}</option>
                <option value="অন্যান্য">{lang === 'bn' ? 'অন্যান্য' : 'Others (অন্যান্য)'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {lang === 'bn' ? 'জরুরিতার মাত্রা *' : 'Urgency Level *'}
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              >
                <option value="স্বাভাবিক">{lang === 'bn' ? 'স্বাভাবিক (Normal)' : 'Normal (স্বাভাবিক)'}</option>
                <option value="মাঝারি">{lang === 'bn' ? 'মাঝারি (Medium)' : 'Medium (মাঝারি)'}</option>
                <option value="জরুরি">{lang === 'bn' ? 'জরুরি (Urgent)' : 'Urgent (জরুরি)'}</option>
              </select>
            </div>
          </div>

          {/* Short Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {lang === 'bn' ? 'সংক্ষিপ্ত শিরোনাম *' : 'Short Title *'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder=""
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              required
            />
          </div>

          {/* Required Assistance */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {lang === 'bn' ? 'ঠিক কী ধরণের বা কী কী সহায়তা প্রয়োজন? *' : 'What kind of assistance is needed? *'}
            </label>
            <input
              type="text"
              value={requiredAssistance}
              onChange={(e) => setRequiredAssistance(e.target.value)}
              placeholder=""
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              required
            />
          </div>

          {/* Beneficiary basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {lang === 'bn' ? 'সহায়তাপ্রার্থী ব্যক্তির নাম/ছদ্মনাম' : 'Beneficiary Name / Alias'}
              </label>
              <input
                type="text"
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                placeholder=""
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {lang === 'bn' ? 'আনুমানিক বয়স' : 'Approximate Age'}
              </label>
              <input
                type="text"
                value={beneficiaryAge}
                onChange={(e) => setBeneficiaryAge(e.target.value)}
                placeholder=""
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Education Specific Section */}
          {category === 'শিক্ষা সহায়তা' && (
            <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>{lang === 'bn' ? 'শিক্ষা সহায়তার অতিরিক্ত তথ্য' : 'Education Support Details'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-indigo-900 mb-1">
                    {lang === 'bn' ? 'শ্রেণি / শিক্ষার স্তর' : 'Grade / Educational Level'}
                  </label>
                  <input
                    type="text"
                    value={eduLevel}
                    onChange={(e) => setEduLevel(e.target.value)}
                    placeholder=""
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-indigo-900 mb-1">
                    {lang === 'bn' ? 'স্কুল বা মাদ্রাসার নাম (ঐচ্ছিক)' : 'School or Madrasa Name (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={eduSchool}
                    onChange={(e) => setEduSchool(e.target.value)}
                    placeholder=""
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-400 focus:outline-hidden"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-indigo-900 mb-1">
                    {lang === 'bn' ? 'প্রয়োজনীয় বই/খাতা/উপকরণ তালিকা' : 'Needed Books / Stationery / Materials'}
                  </label>
                  <input
                    type="text"
                    value={eduMaterials}
                    onChange={(e) => setEduMaterials(e.target.value)}
                    placeholder=""
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-400 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Needs Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {lang === 'bn' ? 'প্রয়োজনের বিস্তারিত বিবরণ *' : 'Detailed Description of Need *'}
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder=""
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              required
            />
          </div>

          {/* Location details & Map click picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                {lang === 'bn'
                  ? 'এলাকার নাম ও অবস্থান (মানচিত্রে ক্লিক করে নির্বাচন করুন) *'
                  : 'Area Name & Location (Click map to select) *'}
              </label>
              <span className="text-[11px] text-slate-500">
                {lang === 'bn' ? 'কোঅর্ডিনেট:' : 'Coordinates:'} {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}
              </span>
            </div>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder=""
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white mb-2 transition"
              required
            />
            <div className="h-48 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
              <InteractiveMap
                isSelectMode={true}
                selectedCoordinates={coords}
                onCoordinateSelect={(newCoords) => setCoords(newCoords)}
                height="190px"
              />
            </div>
          </div>

          {/* Image Upload with Drag & Drop & Validation */}
          <div>
            <ImageUpload value={imageUrl} onChange={setImageUrl} />
            {/* Quick Sample presets */}
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 mt-2">
              <span className="text-[11px] font-medium text-slate-400">
                {lang === 'bn' ? 'অথবা নমুনা ছবি নির্বাচন করুন:' : 'Or pick a sample photo:'}
              </span>
              {sampleImages.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImageUrl(s.url)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-lg text-[11px] font-medium transition cursor-pointer"
                >
                  {lang === 'bn' ? s.labelBn : s.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Info / Verification note */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {lang === 'bn' ? 'অতিরিক্ত তথ্য বা ভেরিফিকেশনের সূত্র (ঐচ্ছিক)' : 'Additional Info / Verification Source (Optional)'}
            </label>
            <input
              type="text"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder=""
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>

          {/* Request Volunteer Checkbox */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
            <input
              type="checkbox"
              id="volNeeded"
              checked={volunteerNeeded}
              onChange={(e) => setVolunteerNeeded(e.target.checked)}
              className="mt-1 w-4 h-4 text-emerald-600 rounded cursor-pointer"
            />
            <label htmlFor="volNeeded" className="text-xs text-slate-700 cursor-pointer">
              <strong className="text-slate-900 block font-bold mb-0.5">
                {lang === 'bn'
                  ? 'এই মানবিক সহায়তায় সরাসরি স্বেচ্ছাসেবক প্রয়োজন'
                  : 'Direct volunteer assistance required for this cause'}
              </strong>
              {lang === 'bn'
                ? '(চিহ্নিত করলে এলাকার স্বেচ্ছাসেবকদের কাছে নোটিফিকেশন পাঠানো হবে এবং সমন্বয়ে গতি আসবে)'
                : '(Notifies local volunteers for faster on-ground coordination)'}
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition cursor-pointer flex items-center gap-1.5"
            >
              {loading ? (
                <span>{lang === 'bn' ? 'আবেদন জমা হচ্ছে...' : 'Submitting...'}</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'সহায়তার আবেদন জমা দিন' : 'Submit Assistance Request'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
