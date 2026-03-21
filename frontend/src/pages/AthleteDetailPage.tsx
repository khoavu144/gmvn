// src/pages/AthleteDetailPage.tsx
// v3.0 — Tailwind thuần · Xóa athleteProfile.css · isOwnProfile Edit button
// Dark sidebar (#gray-950) · Mobile: sidebar ẩn, sticky CTA bottom
// Athlete accent: slate/gray cool palette

import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { Pencil, ArrowRight, MessageSquare } from 'lucide-react';
import { fetchPublicProfile } from '../store/slices/profileSlice';
import type { AppDispatch, RootState } from '../store/store';
import { getSrcSet, getOptimizedUrl } from '../utils/image';
import ShareButton from '../components/ShareButton';

import apiClient from '../services/api';
import { buildProfileShareUrl } from '../utils/share';

// ─── Types ───────────────────────────────────────────────────────────────
interface SocialLinks {
  instagram?: string | null;
  tiktok?: string | null;
  facebook?: string | null;
  youtube?: string | null;
}
const SOCIAL_META: { key: keyof SocialLinks; label: string }[] = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'youtube', label: 'YouTube' },
];
function toAbsoluteUrl(raw: string): string {
  if (!raw) return '#';
  return raw.startsWith('http') ? raw : `https://${raw}`;
}

interface RelatedAthlete {
  id: string;
  slug: string | null;
  profile_slug?: string | null;
  full_name: string;
  avatar_url: string | null;
  specialties: string[] | null;
  user_type?: string;
}

// ─── Related section ─────────────────────────────────────────────────────
function RelatedAthletesSection({ athletes }: { athletes: RelatedAthlete[] }) {
  const [page, setPage] = useState(0);
  if (!athletes.length) return null;
  const PAGE_SIZE = 2;
  const totalPages = Math.ceil(athletes.length / PAGE_SIZE);
  const visible = athletes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <section className="border-t border-gray-200 py-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black uppercase tracking-tight text-black">
            Vận động viên tương tự
          </h3>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-black hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ‹
              </button>
              <span className="text-[12px] font-semibold text-gray-500">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-black hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ›
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visible.map((a) => {
            const resolvedSlug = a.profile_slug ?? a.slug;
            const link = resolvedSlug ? `/athlete/${resolvedSlug}` : `/athlete/${a.id}`;
            return (
              <Link
                key={a.id}
                to={link}
                className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-black hover:shadow-md transition-all duration-150 group"
              >
                {a.avatar_url ? (
                  <img
                    src={getOptimizedUrl(a.avatar_url, 80)}
                    alt={a.full_name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <span className="text-[18px] font-black text-gray-400">
                      {a.full_name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-black group-hover:underline truncate">
                    {a.full_name}
                  </p>
                  {a.specialties && a.specialties.length > 0 && (
                    <p className="text-[12px] text-gray-500 mt-0.5">
                      {a.specialties.slice(0, 2).join(' · ')}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Main component ───────────────────────────────────────────────────────
export default function AthleteDetailPage() {
  const { identifier, slug } = useParams<{ identifier?: string; slug?: string }>();
  const resolvedIdentifier = identifier || slug;
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    viewedProfile: profile,
    viewedExperience: experience,
    viewedGallery: gallery,
    viewedPackages: packages,
    loading,
    error,
  } = useSelector((state: RootState) => state.profile);

  const [relatedAthletes, setRelatedAthletes] = useState<RelatedAthlete[]>([]);
  const [progressPhotos, setProgressPhotos] = useState<
    { id: string; before_url?: string | null; after_url?: string | null; caption?: string | null }[]
  >([]);
  const [activeSection, setActiveSection] = useState('about');

  useEffect(() => {
    if (resolvedIdentifier) dispatch(fetchPublicProfile(resolvedIdentifier));
  }, [resolvedIdentifier, dispatch]);

  const athlete = profile?.trainer;
  const isAthleteProfile = athlete?.user_type === 'athlete';

  // Own profile detection
  const isOwnProfile = !!(user && profile && user.id === profile.trainer_id);

  useEffect(() => {
    if (!profile || !athlete) return;
    if (!isAthleteProfile) {
      const coachRoute = profile.slug ? `/coach/${profile.slug}` : `/coaches/${profile.trainer_id}`;
      navigate(coachRoute, { replace: true });
    }
  }, [profile, athlete, isAthleteProfile, navigate]);

  useEffect(() => {
    if (!profile?.trainer_id || !isAthleteProfile) return;
    apiClient
      .get(`/users/trainers/${profile.trainer_id}/similar?limit=6&user_type=athlete`)
      .then((res) => {
        const d = res.data?.data;
        if (Array.isArray(d)) setRelatedAthletes(d);
      })
      .catch(() => {});
    apiClient
      .get(`/profiles/trainer/${profile.trainer_id}/progress-photos`)
      .then((res) => {
        const d = res.data?.photos || res.data?.data || [];
        if (Array.isArray(d)) setProgressPhotos(d);
      })
      .catch(() => {});
  }, [profile?.trainer_id, isAthleteProfile]);

  const canonicalPath = useMemo(() => {
    if (profile?.slug) return `/athlete/${profile.slug}`;
    if (profile?.trainer_id) return `/athletes/${profile.trainer_id}`;
    return resolvedIdentifier ? `/athletes/${resolvedIdentifier}` : '/coaches?type=athlete';
  }, [profile?.slug, profile?.trainer_id, resolvedIdentifier]);

  const canonicalUrl = `${window.location.origin}${canonicalPath}`;
  const shareIdentifier = profile?.slug || profile?.trainer_id || resolvedIdentifier || '';
  const shareUrl = shareIdentifier ? buildProfileShareUrl('athlete', shareIdentifier) : canonicalUrl;
  const seoTitle = useMemo(
    () => `${athlete?.full_name || 'Athlete'} | Athlete Profile | GYMERVIET`,
    [athlete?.full_name]
  );
  const seoDescription = useMemo(() => {
    const bio = profile?.bio_short || profile?.bio_long || athlete?.bio || '';
    return bio ? bio.slice(0, 155) : 'Hồ sơ vận động viên trên GYMERVIET.';
  }, [profile?.bio_short, profile?.bio_long, athlete?.bio]);

  // Data
  const athleteAchievements = experience.filter(
    (e) => e.experience_type === 'achievement' || e.experience_type === 'certification'
  );
  const athleteExperiences = experience.filter(
    (e) => e.experience_type === 'work' || e.experience_type === 'education'
  );
  const socialLinks: SocialLinks = profile?.social_links || {};
  const visibleSocials = SOCIAL_META.filter((m) => !!socialLinks[m.key]);


  const displayMetrics = [
    { value: `${profile?.years_experience ?? 0}+`, label: 'Năm kinh nghiệm' },
    { value: String(athleteAchievements.length), label: 'Thành tích' },
    { value: String(gallery.length), label: 'Ảnh' },
  ];

  const navItems = [
    { id: 'about', label: 'Giới thiệu' },
    { id: 'achievements', label: 'Thành tích' },
    ...(packages.length ? [{ id: 'services', label: 'Dịch vụ' }] : []),
    ...(gallery.length ? [{ id: 'gallery', label: 'Gallery' }] : []),
    ...(progressPhotos.length ? [{ id: 'progress', label: 'Hành trình' }] : []),
  ];

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(`athlete-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleMessage = () => {
    if (!profile?.trainer_id) return;
    if (!user) { navigate('/login'); return; }
    navigate(`/messages?to=${profile.trainer_id}`);
  };

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-[1200px] mx-auto flex">
          <div className="w-64 shrink-0 bg-gray-950 h-[calc(100vh-56px)] sticky top-14" />
          <div className="flex-1 p-7 space-y-4">
            <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-40 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile || !athlete) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-[15px] font-medium text-black">Không tìm thấy hồ sơ vận động viên.</p>
        <Link
          to="/coaches?type=athlete"
          className="inline-flex items-center gap-2 h-10 px-5 bg-black text-white text-[14px] font-bold uppercase tracking-widest rounded-lg hover:bg-gray-900 transition-colors"
        >
          ← Về danh sách
        </Link>
      </div>
    );
  }

  if (!isAthleteProfile) return null;

  const displayBio = profile.bio_long || profile.bio_short || athlete.bio || '';
  const avatarUrl = athlete.avatar_url;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="GYMERVIET" />
        {avatarUrl && <meta property="og:image" content={avatarUrl} />}
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: athlete?.full_name,
          description: seoDescription,
          image: avatarUrl || undefined,
          url: canonicalUrl,
          knowsAbout: athlete?.specialties ?? [],
        })}</script>
      </Helmet>

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <Link
            to="/coaches?type=athlete"
            className="text-[13px] font-semibold text-gray-500 hover:text-black transition-colors"
          >
            ← Vận động viên
          </Link>
          <div className="flex items-center gap-2">
            {/* Own profile edit button */}
            {isOwnProfile && (
              <Link
                to="/profile"
                className="inline-flex items-center gap-1.5 h-8 px-3 border border-gray-300 rounded-lg text-[12px] font-semibold text-gray-700 hover:border-black hover:text-black transition-colors"
              >
                <Pencil className="w-3 h-3" />
                Chỉnh sửa hồ sơ
              </Link>
            )}
            <ShareButton
              url={shareUrl}
              title={seoTitle}
              text={seoDescription}
              label="Chia sẻ"
              variant="facebook"
              titleAttr="Chia sẻ hồ sơ này"
            />
          </div>
        </div>
      </div>

      {/* ── Layout: sidebar + main ── */}
      <div className="max-w-[1200px] mx-auto flex">

        {/* ── DARK SIDEBAR — desktop only ── */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-gray-950 text-white sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
          <div className="flex flex-col gap-1 px-0 py-7">

            {/* Avatar */}
            <div className="relative w-20 h-20 mx-auto mb-4">
              {avatarUrl ? (
                <img
                  src={getOptimizedUrl(avatarUrl, 160)}
                  srcSet={getSrcSet(avatarUrl)}
                  alt={athlete.full_name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-white/15"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/15 flex items-center justify-center">
                  <span className="text-[28px] font-black text-white/80">
                    {athlete.full_name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-950" />
            </div>

            {/* Identity */}
            <div className="px-5 text-center mb-2">
              <p className="text-[15px] font-black text-white leading-tight">{athlete.full_name}</p>
              {athlete.is_verified && (
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-green-400">
                  ✓ Elite Athlete
                </span>
              )}
              {profile.headline && (
                <p className="text-[12px] text-white/50 mt-1 leading-snug">{profile.headline}</p>
              )}
              {profile.location && (
                <p className="text-[12px] text-white/40 mt-1">📍 {profile.location}</p>
              )}
            </div>

            {/* Mini stats */}
            <div className="mx-4 grid grid-cols-3 gap-1 p-3 bg-white/5 rounded-lg mb-3">
              {displayMetrics.map((m, i) => (
                <div key={i} className="text-center">
                  <p className="text-[16px] font-black text-white">{m.value}</p>
                  <p className="text-[9px] text-white/40 uppercase tracking-[0.08em] leading-tight mt-0.5">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Nav items */}
            <nav className="px-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  className={[
                    'w-full text-left px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-colors duration-150',
                    activeSection === item.id
                      ? 'bg-white text-black'
                      : 'text-white/60 hover:bg-white/10 hover:text-white',
                  ].join(' ')}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Social links */}
            {visibleSocials.length > 0 && (
              <div className="px-5 mt-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/30 mb-2">
                  Mạng xã hội
                </p>
                <div className="flex flex-wrap gap-2">
                  {visibleSocials.map(({ key, label }) => (
                    <a
                      key={key}
                      href={toAbsoluteUrl(socialLinks[key] as string)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-white/50 hover:text-white border border-white/15 hover:border-white/40 px-2.5 py-1 rounded transition-colors"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="px-4 mt-4">
              <button
                onClick={handleMessage}
                className="w-full flex items-center justify-center gap-2 h-10 bg-white text-black text-[13px] font-bold uppercase tracking-widest rounded-lg hover:bg-gray-100 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Nhắn tin
              </button>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 py-6 space-y-0">

          {/* ── HERO BENTO ── */}
          <div id="athlete-section-about" className="scroll-mt-24">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-4 mb-6">

              {/* Identity card */}
              <div className="relative bg-gray-950 rounded-xl overflow-hidden p-6 min-h-[220px] flex flex-col justify-end">
                {avatarUrl && (
                  <div className="absolute inset-0">
                    <img src={avatarUrl} alt="" aria-hidden className="w-full h-full object-cover opacity-15" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-transparent" />
                  </div>
                )}
                <div className="relative">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-[0.12em] bg-white/10 text-white/60 px-2.5 py-1 rounded mb-3">
                    {athlete.specialties?.[0] || 'Pro Athlete'}
                  </span>
                  <h1 className="text-[28px] sm:text-[34px] font-black text-white tracking-tight leading-none">
                    {athlete.full_name}
                    {athlete.is_verified && (
                      <span className="ml-2 text-[14px] text-green-400">✓</span>
                    )}
                  </h1>
                  {profile.headline && (
                    <p className="text-[14px] text-white/55 mt-2 leading-snug">{profile.headline}</p>
                  )}
                  {profile.location && (
                    <p className="text-[13px] text-white/40 mt-1">📍 {profile.location}</p>
                  )}
                </div>
              </div>

              {/* Stats card */}
              <div className="bg-gray-950 rounded-xl p-5 flex flex-col justify-between">
                <div className="space-y-5">
                  {displayMetrics.map((m, i) => (
                    <div key={i}>
                      <p className="text-[26px] font-black text-white leading-none">{m.value}</p>
                      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/35 mt-1">
                        {m.label}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleMessage}
                  className="mt-4 flex items-center gap-1.5 text-[12px] font-bold text-white/60 hover:text-white transition-colors"
                >
                  Liên hệ ngay <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bio + tags */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-4">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500 mb-3">
                Athlete Dossier
              </h2>
              <p className="text-[14px] text-gray-700 leading-relaxed">
                {displayBio || 'Chưa có giới thiệu.'}
              </p>
              {athlete.specialties && athlete.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {athlete.specialties.map((s, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded border border-gray-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={handleMessage}
                  className="inline-flex items-center gap-2 h-9 px-4 bg-black text-white text-[13px] font-bold uppercase tracking-widest rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Nhắn tin
                </button>
              </div>
            </div>
          </div>

          {/* ── THÀNH TÍCH & KINH NGHIỆM ── */}
          {(athleteAchievements.length > 0 || athleteExperiences.length > 0) && (
            <div id="athlete-section-achievements" className="scroll-mt-24 py-10 border-t border-gray-200">
              <div className="mb-6">
                <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                  Thành tích & Kinh nghiệm
                </h2>
                <p className="text-[14px] text-gray-600 mt-1">Hành trình thi đấu và huấn luyện</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Timeline */}
                <div>
                  {athleteExperiences.length > 0 ? (
                    <div className="space-y-4">
                      {athleteExperiences.map((e, i) => (
                        <div
                          key={e.id}
                          className="flex gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                        >
                          <div className="flex flex-col items-center pt-1">
                            <div
                              className={[
                                'w-3 h-3 rounded-full shrink-0',
                                e.is_current ? 'bg-black' : 'bg-gray-300',
                              ].join(' ')}
                            />
                            {i < athleteExperiences.length - 1 && (
                              <div className="w-px flex-1 bg-gray-200 mt-2" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={[
                                'text-[11px] font-bold uppercase tracking-[0.1em] mb-1',
                                e.is_current ? 'text-black' : 'text-gray-400',
                              ].join(' ')}
                            >
                              {e.start_date?.slice(0, 7)}
                              {e.is_current ? ' – Hiện tại' : e.end_date ? ` – ${e.end_date.slice(0, 7)}` : ''}
                            </p>
                            <p className="text-[14px] font-bold text-black">{e.title}</p>
                            <p className="text-[12px] text-gray-500">{e.organization}</p>
                            {e.description && (
                              <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">
                                {e.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] text-gray-400">Chưa có kinh nghiệm.</p>
                  )}
                </div>

                {/* Awards list */}
                <div>
                  {athleteAchievements.length > 0 && (
                    <div className="space-y-3">
                      {athleteAchievements.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                        >
                          <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-gray-100 rounded-lg text-[18px]">
                            {a.experience_type === 'achievement' ? '🏆' : '📜'}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-black">{a.title}</p>
                            <p className="text-[12px] text-gray-500 mt-0.5">
                              {a.organization}
                              {a.start_date ? ` · ${a.start_date.slice(0, 4)}` : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── GÓI DỊCH VỤ ── */}
          {packages.length > 0 && (
            <div id="athlete-section-services" className="scroll-mt-24 py-10 border-t border-gray-200">
              <div className="mb-6">
                <h2 className="text-2xl font-black uppercase tracking-tight text-black">Gói dịch vụ</h2>
                <p className="text-[14px] text-gray-600 mt-1">
                  Đăng ký huấn luyện cùng {athlete.full_name}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={[
                      'rounded-lg p-6 flex flex-col gap-3 border',
                      pkg.is_popular
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-200 shadow-sm',
                    ].join(' ')}
                  >
                    {pkg.is_popular && (
                      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/50">
                        Phổ biến nhất
                      </span>
                    )}
                    <h3 className="text-[15px] font-bold">{pkg.name}</h3>
                    <div>
                      <span className="text-[26px] font-black tracking-tight">
                        {pkg.price ? `${Number(pkg.price).toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                      </span>
                      <span className={`text-[12px] font-medium ml-1 ${pkg.is_popular ? 'text-white/50' : 'text-gray-400'}`}>
                        /{pkg.duration_months === 1 ? 'tháng' : `${pkg.duration_months} tháng`}
                      </span>
                    </div>
                    {pkg.sessions_per_week && (
                      <p className={`text-[13px] ${pkg.is_popular ? 'text-white/60' : 'text-gray-500'}`}>
                        {pkg.sessions_per_week} buổi/tuần
                      </p>
                    )}
                    <button
                      onClick={handleMessage}
                      className={[
                        'mt-auto h-10 rounded-lg text-[13px] font-bold uppercase tracking-widest transition-colors',
                        pkg.is_popular
                          ? 'bg-white text-black hover:bg-gray-100'
                          : 'bg-black text-white hover:bg-gray-900',
                      ].join(' ')}
                    >
                      Liên hệ
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── GALLERY ── */}
          {gallery.length > 0 && (
            <div id="athlete-section-gallery" className="scroll-mt-24 py-10 border-t border-gray-200">
              <div className="mb-6">
                <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                  Gallery{' '}
                  <span className="text-[13px] font-medium text-gray-400 ml-2 normal-case">
                    {gallery.length} ảnh
                  </span>
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {gallery.map((item) => (
                  <a
                    key={item.id}
                    href={item.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square overflow-hidden rounded-lg bg-gray-100 hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={getOptimizedUrl(item.image_url, 400)}
                      srcSet={getSrcSet(item.image_url)}
                      sizes="(max-width: 640px) 50vw, 33vw"
                      alt={item.caption || 'Gallery'}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ── HÀNH TRÌNH BEFORE/AFTER ── */}
          {progressPhotos.length > 0 && (
            <div id="athlete-section-progress" className="scroll-mt-24 py-10 border-t border-gray-200">
              <div className="mb-6">
                <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                  Hành trình thay đổi
                </h2>
                <p className="text-[14px] text-gray-600 mt-1">Before & After</p>
              </div>
              <div className="space-y-6">
                {progressPhotos.map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-2 gap-3 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                  >
                    {p.before_url && (
                      <div>
                        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500">
                            Trước
                          </span>
                        </div>
                        <img
                          src={getOptimizedUrl(p.before_url, 400)}
                          alt="Before"
                          className="w-full aspect-[4/5] object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    {p.after_url && (
                      <div>
                        <div className="px-3 py-2 bg-black">
                          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/70">
                            Sau
                          </span>
                        </div>
                        <img
                          src={getOptimizedUrl(p.after_url, 400)}
                          alt="After"
                          className="w-full aspect-[4/5] object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    {p.caption && (
                      <p className="col-span-2 px-4 py-3 text-[13px] text-gray-600 border-t border-gray-100">
                        {p.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Related athletes */}
      <RelatedAthletesSection athletes={relatedAthletes} />

      {/* ── MOBILE STICKY CTA — hidden on desktop ── */}
      <div className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-white border-t border-gray-200 px-4 py-3"
           style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
        <button
          onClick={handleMessage}
          className="flex items-center justify-center gap-2 w-full h-11 bg-black text-white text-[14px] font-bold uppercase tracking-widest rounded-lg active:bg-gray-800 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          Nhắn tin với {athlete.full_name.split(' ').pop()}
        </button>
      </div>
    </div>
  );
}
