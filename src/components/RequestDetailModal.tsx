import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.ts';
import { HelpRequest } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  AlertTriangle,
  Bookmark,
  Calendar,
  CheckCircle2,
  Clock,
  Flag,
  GraduationCap,
  Heart,
  HeartHandshake,
  MapPin,
  Share2,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { InteractiveMap } from './InteractiveMap.tsx';
import { StatusTracker } from './StatusTracker.tsx';
import { AssistModal } from './AssistModal.tsx';
import { VolunteerAppealModal } from './VolunteerAppealModal.tsx';
import { CompleteModal } from './CompleteModal.tsx';

interface RequestDetailModalProps {
  requestId: number;
  onClose: () => void;
  onRefresh?: () => void;
  onOpenLogin?: () => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  requestId,
  onClose,
  onRefresh,
  onOpenLogin,
}) => {
  const { user } = useAuth();
  const [data, setData] = useState<{
    request: HelpRequest;
    actions: any[];
    activities: any[];
    appeals: any[];
    hasReported: boolean;
    isSaved?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sub-modals
  const [showAssistModal, setShowAssistModal] = useState(false);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Report state
  const [reportReason, setReportReason] = useState('ভুল বা সন্দেহজনক তথ্য');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const [actionSuccess, setActionSuccess] = useState('');
  const [savingBookmark, setSavingBookmark] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getRequestDetails(requestId);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'সহায়তার বিস্তারিত লোড করা সম্ভব হয়নি।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [requestId]);

  const handleToggleBookmark = async () => {
    if (!user) {
      if (onOpenLogin) onOpenLogin();
      return;
    }
    setSavingBookmark(true);
    try {
      const res = await api.toggleSaveRequest(requestId);
      setData((prev) =>
        prev
          ? {
              ...prev,
              isSaved: res.saved,
              request: { ...prev.request, isSaved: res.saved },
            }
          : null
      );
      setActionSuccess(res.message);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingBookmark(false);
    }
  };

  const handleJoinVolunteer = async () => {
    if (!user) {
      if (onOpenLogin) onOpenLogin();
      return;
    }
    try {
      await api.joinVolunteer(requestId);
      setActionSuccess('আপনি এই মানবিক কার্যক্রমে স্বেচ্ছাসেবক হিসেবে যুক্ত হয়েছেন!');
      await fetchDetails();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (onOpenLogin) onOpenLogin();
      return;
    }
    setSubmittingReport(true);
    try {
      await api.reportRequest(requestId, {
        reason: reportReason,
        details: reportDetails,
      });
      setShowReportModal(false);
      setActionSuccess('আপনার রিপোর্টটি জমা নেওয়া হয়েছে। অ্যাডমিন টিম এটি পর্যালোচনা করবে।');
      await fetchDetails();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 font-bengali">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm font-semibold">সহায়তার সুযোগটি লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 font-bengali">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <p className="text-rose-600 font-bold mb-4">{error || 'তথ্য পাওয়া যায়নি।'}</p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    );
  }

  const { request: req, actions, activities, appeals, hasReported, isSaved } = data;
  let parsedEdu: any = null;
  if (req.educationDetails) {
    try {
      parsedEdu = JSON.parse(req.educationDetails);
    } catch (e) {
      // Ignore
    }
  }

  const isCreator = user?.id === req.creatorId;
  const isAdmin = user?.role === 'ADMIN';
  const isVolunteer = user?.role === 'VOLUNTEER';
  const isAssignedVolunteer = user?.id === req.assignedVolunteerId;
  const canComplete = isAdmin || isCreator || isAssignedVolunteer;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto font-bengali">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
          {/* Modal Header */}
          <div className="px-5 py-4 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                সাহায্যের সুযোগ (Help Opportunity)
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  req.urgency === 'জরুরি'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                    : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {req.category} • {req.urgency}
              </span>
              {req.isVerified && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> ✓ যাচাইকৃত আবেদন
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Bookmark Button */}
              <button
                onClick={handleToggleBookmark}
                disabled={savingBookmark}
                className={`p-2 rounded-xl border transition flex items-center gap-1 text-xs font-bold cursor-pointer ${
                  isSaved
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title={isSaved ? 'সংরক্ষিত তালিকা থেকে সরান' : 'সংরক্ষণ করুন'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                <span className="hidden sm:inline">{isSaved ? 'সংরক্ষিত' : 'সংরক্ষণ করুন'}</span>
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: req.title,
                      text: req.description,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('লিঙ্কটি কপি করা হয়েছে!');
                  }
                }}
                className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-200/50 rounded-xl transition cursor-pointer"
                title="শেয়ার করুন"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
            {actionSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Visual Status Progress Tracker (8 stages) */}
            <StatusTracker currentStatus={req.status} isVerified={req.isVerified} />

            {/* Title and metadata */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug mb-2">
                {req.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{req.locationName} (সাধারণ এলাকা)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    প্রকাশিত:{' '}
                    {new Date(req.createdAt).toLocaleDateString('bn-BD', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>আবেদনকারী: {req.creatorName || 'সাধারণ ব্যবহারকারী'}</span>
                </div>
              </div>
            </div>

            {/* Image if provided */}
            {req.imageUrl && (
              <div className="rounded-2xl overflow-hidden max-h-72 w-full border border-slate-200 shadow-xs">
                <img
                  src={req.imageUrl}
                  alt={req.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Privacy Protection Notice */}
            <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl text-xs text-amber-950 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>গোপনীয়তা সুরক্ষা নীতি:</strong> সহায়তাপ্রার্থী মানুষের মর্যাদা ও সুরক্ষার্থে
                সুনির্দিষ্ট বাসার ঠিকানা ও ব্যক্তিগত ফোন নম্বর সর্বসাধারণের জন্য অপ্রকাশ্য রাখা হয়েছে।
                সমন্বয়ের জন্য দায়িত্বপ্রাপ্তদের সঙ্গেই প্রয়োজনীয় তথ্য ভাগ করা হবে।
              </div>
            </div>

            {/* Beneficiary basic info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-xs text-slate-500 font-medium block mb-1">
                  সহায়তাপ্রার্থী ব্যক্তি
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {req.beneficiaryName || 'ছদ্মনাম সংরক্ষিত'}{' '}
                  {req.beneficiaryAge ? `(${req.beneficiaryAge})` : ''}
                </p>
              </div>
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/70">
                <span className="text-xs text-emerald-800 font-medium block mb-1">
                  প্রয়োজনীয় সহযোগিতার ধরন
                </span>
                <p className="font-bold text-emerald-950 text-sm">{req.requiredAssistance}</p>
              </div>
            </div>

            {/* Education Details if applicable */}
            {parsedEdu && (
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  <span>শিক্ষা সহায়তার বিবরণ</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-indigo-950">
                  {parsedEdu.level && (
                    <div>
                      <span className="font-semibold text-indigo-800">শ্রেণি/স্তর:</span>{' '}
                      {parsedEdu.level}
                    </div>
                  )}
                  {parsedEdu.age && (
                    <div>
                      <span className="font-semibold text-indigo-800">শিক্ষার্থীর বয়স:</span>{' '}
                      {parsedEdu.age}
                    </div>
                  )}
                  {parsedEdu.neededMaterials && (
                    <div className="sm:col-span-2">
                      <span className="font-semibold text-indigo-800">প্রয়োজনীয় উপকরণ:</span>{' '}
                      {parsedEdu.neededMaterials}
                    </div>
                  )}
                  {parsedEdu.school && (
                    <div className="sm:col-span-2">
                      <span className="font-semibold text-indigo-800">শিক্ষা প্রতিষ্ঠান/এলাকা:</span>{' '}
                      {parsedEdu.school}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Detailed Description */}
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">প্রয়োজনের বিস্তারিত বিবরণ</h4>
              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-slate-50/60 p-4 rounded-2xl border border-slate-200/80">
                {req.description}
              </div>
            </div>

            {req.additionalInfo && (
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">অতিরিক্ত তথ্য ও ভেরিফিকেশন নোট</h4>
                <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {req.additionalInfo}
                </p>
              </div>
            )}

            {/* Map Preview */}
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>আনুমানিক ভৌগোলিক অবস্থান (মানচিত্র)</span>
              </h4>
              <div className="h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                <InteractiveMap
                  requests={[req]}
                  selectedRequestId={req.id}
                  height="176px"
                />
              </div>
            </div>

            {/* Volunteer Appeals & Coordination Section */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">
                    স্বেচ্ছাসেবক সহায়তা স্থিতি
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    {req.assignedVolunteerId ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <UserCheck className="w-4 h-4 text-emerald-600" /> স্বেচ্ছাসেবক নিযুক্ত আছেন
                      </span>
                    ) : req.volunteerNeeded ? (
                      <span className="text-amber-700 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-amber-600" /> এই মুহূর্তে স্বেচ্ছাসেবক প্রয়োজন
                      </span>
                    ) : (
                      <span className="text-slate-600">স্বেচ্ছাসেবক আহ্বান অপেক্ষমাণ</span>
                    )}
                  </p>
                </div>

                {/* Join Volunteer button */}
                {!req.assignedVolunteerId && isVolunteer && (
                  <button
                    onClick={handleJoinVolunteer}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    স্বেচ্ছাসেবক হিসেবে যুক্ত হোন
                  </button>
                )}

                {/* Mark Completed Button */}
                {canComplete && req.status !== 'সম্পন্ন' && (
                  <button
                    onClick={() => setShowCompleteModal(true)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    সহায়তা সম্পন্ন হয়েছে
                  </button>
                )}
              </div>

              {/* Coordination info if assigned */}
              {(isCreator || isAssignedVolunteer || isAdmin) && activities.length > 0 && (
                <div className="pt-3 border-t border-slate-200 text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-slate-900 block">সমন্বয় তথ্য (নিযুক্ত ব্যক্তিগণ):</span>
                  {activities.map((act) => (
                    <div key={act.id} className="flex items-center justify-between">
                      <span>স্বেচ্ছাসেবক: <strong>{act.volunteerName}</strong></span>
                      {act.volunteerPhone && <span>যোগাযোগ: <strong>{act.volunteerPhone}</strong></span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assistance Pledges List */}
            {actions.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500 fill-current" />
                  <span>সাহায্যের প্রতিশ্রুতি ও অঙ্গীকার ({actions.length})</span>
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {actions.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {act.helperName} — <span className="text-emerald-700">{act.assistanceType}</span>
                        </span>
                        {act.message && <p className="text-slate-600 mt-0.5">{act.message}</p>}
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                        {new Date(act.createdAt).toLocaleDateString('bn-BD', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completion note if completed */}
            {req.status === 'সম্পন্ন' && req.completionNotes && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950">
                <span className="font-bold text-emerald-800 block mb-1">
                  ✅ সহায়তা সফলভাবে সম্পন্ন হয়েছে:
                </span>
                <p>{req.completionNotes}</p>
              </div>
            )}
          </div>

          {/* Modal Bottom Action Footer */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              {!hasReported ? (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 transition cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>রিপোর্ট করুন</span>
                </button>
              ) : (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  রিপোর্ট জমা রয়েছে
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {/* Volunteer appeal button (Creator, Admin, or when needed) */}
              {(isCreator || isAdmin || !req.volunteerNeeded) && req.status !== 'সম্পন্ন' && (
                <button
                  onClick={() => {
                    if (!user) {
                      if (onOpenLogin) onOpenLogin();
                      return;
                    }
                    setShowAppealModal(true);
                  }}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
                >
                  স্বেচ্ছাসেবক প্রয়োজন
                </button>
              )}

              {/* “আমি সাহায্য করব” Button */}
              {req.status !== 'সম্পন্ন' && req.status !== 'বাতিল' && (
                <button
                  onClick={() => {
                    if (!user) {
                      if (onOpenLogin) onOpenLogin();
                      return;
                    }
                    setShowAssistModal(true);
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 flex items-center gap-2 transition cursor-pointer"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>আমি সাহায্য করব</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Standalone Sub-Modals */}
      <AssistModal
        request={req}
        isOpen={showAssistModal}
        onClose={() => setShowAssistModal(false)}
        onSuccess={() => {
          setActionSuccess('আপনার মানবিক সহায়তা সফলভাবে নিশ্চিত হয়েছে! ধন্যবাদ।');
          fetchDetails();
          if (onRefresh) onRefresh();
        }}
      />

      <VolunteerAppealModal
        request={req}
        isOpen={showAppealModal}
        onClose={() => setShowAppealModal(false)}
        onSuccess={() => {
          setActionSuccess('নিকটস্থ স্বেচ্ছাসেবকদের কাছে জরুরি আহ্বান পাঠানো হয়েছে!');
          fetchDetails();
          if (onRefresh) onRefresh();
        }}
      />

      <CompleteModal
        request={req}
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onSuccess={() => {
          setActionSuccess('সহায়তা কার্যক্রমটি সম্পন্ন হিসেবে সফলভাবে চিহ্নিত হয়েছে!');
          fetchDetails();
          if (onRefresh) onRefresh();
        }}
      />

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 font-bengali">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-600" />
                <span>রিপোর্ট করুন (অভিযোগ)</span>
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  রিপোর্টের কারণ
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white"
                >
                  <option value="ভুল বা সন্দেহজনক তথ্য">ভুল বা সন্দেহজনক তথ্য</option>
                  <option value="প্রতারণা বা অননুমোদিত সাহায্য প্রার্থনা">প্রতারণা বা অননুমোদিত সাহায্য প্রার্থনা</option>
                  <option value="ব্যক্তিগত তথ্যের অপব্যবহার">ব্যক্তিগত তথ্যের অপব্যবহার</option>
                  <option value="অন্যান্য আপত্তি">অন্যান্য আপত্তি</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  বিস্তারিত কারণ (ঐচ্ছিক)
                </label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={3}
                  placeholder="কেন এই আবেদনটি সন্দেহজনক মনে হচ্ছে, তা ব্যাখ্যা করুন..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 rounded-xl text-xs font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {submittingReport ? 'প্রেরণ হচ্ছে...' : 'রিপোর্ট জমা দিন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
