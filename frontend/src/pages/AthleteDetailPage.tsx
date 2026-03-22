import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { Pencil } from 'lucide-react';
import { fetchPublicProfile } from '../store/slices/profileSlice';
import type { AppDispatch, RootState } from '../store/store';
import { getSrcSet, getOptimizedUrl } from '../utils/image';
import ShareButton from '../components/ShareButton';
import apiClient from '../services/api';
import { buildProfileShareUrl } from '../utils/share';
import '../styles/coachProfile.css';
import ProfileSidebar from '../components/profile/ProfileSidebar';
import { profileNavItemsFromLabels } from '../components/profile/profileSidebarNav';
import CoachMobileNav from '../components/profile/CoachMobileNav';
import ProfileHeroSection from '../components/profile/ProfileHeroSection';
import ProfileExperienceSection from '../components/profile/ProfileExperienceSection';
import ProfilePricingSection from '../components/profile/ProfilePricingSection';
import ProfileContactSection from '../components/profile/ProfileContactSection';
import CoachResultsShowcase from '../components/coach-flagship/CoachResultsShowcase';
import CoachRelatedFooter from '../components/coach-flagship/CoachRelatedFooter';
import { Skeleton } from '../components/ui/Skeleton';
import type { TrainerExperience, TrainerPackage } from '../types';

interface RelatedAthlete {
  id: string;
  slug: string | null;
  profile_slug?: string | null;
  full_name: string;
  avatar_url: string | null;
  specialties: string[] | null;
  user_type?: string;
}

function truncateMetaDescription(text: string, maxLen: number): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  const slice = t.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(' ');
  const head = lastSpace > 40 ? slice.slice(0, lastSpace) : slice;
  return `${head.trimEnd()}…`;
}

function buildAthleteMetaDescription(opts: {
  bio: string;
  fullName: string;
  specialties: string[] | null;
  location: string | null | undefined;
}): string {
  const suffix = ' — GYMERVIET';
  const max = Math.max(80, 155 - suffix.length);
  if (opts.bio?.trim()) {
    return truncateMetaDescription(opts.bio.trim(), max) + suffix;
  }
  const spec = opts.specialties?.filter(Boolean).slice(0, 2).join(', ');
  const loc = opts.location?.trim();
  let base = `${opts.fullName} là vận động viên`;
  if (spec) base += ` — ${spec}`;
  if (loc) base += ` · ${loc}`;
  base += '.';
  return truncateMetaDescription(base, max) + suffix;
}

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

  useEffect(() => {
    if (resolvedIdentifier) dispatch(fetchPublicProfile(resolvedIdentifier));
  }, [resolvedIdentifier, dispatch]);

  const athlete = profile?.trainer;
  const isAthleteProfile = athlete?.user_type === 'athlete';
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
      .catch(() => { });
    apiClient
      .get(`/profiles/trainer/${profile.trainer_id}/progress-photos`)
      .then((res) => {
        const d = res.data?.photos || res.data?.data || [];
        if (Array.isArray(d)) setProgressPhotos(d);
      })
      .catch(() => { });
  }, [profile?.trainer_id, isAthleteProfile]);

  const BASE_URL = import.meta.env.VITE_CANONICAL_BASE_URL ?? (typeof window !== 'undefined' ? window.location.origin : 'https://gymerviet.com');

  const canonicalPath = useMemo(() => {
    if (profile?.slug) return `/athlete/${profile.slug}`;
    if (profile?.trainer_id) return `/athletes/${profile.trainer_id}`;
    return resolvedIdentifier ? `/athletes/${resolvedIdentifier}` : '/coaches?type=athlete';
  }, [profile?.slug, profile?.trainer_id, resolvedIdentifier]);

  const canonicalUrl = `${BASE_URL}${canonicalPath}`;
  const shareIdentifier = profile?.slug || profile?.trainer_id || resolvedIdentifier || '';
  const shareUrl = shareIdentifier ? buildProfileShareUrl('athlete', shareIdentifier) : canonicalUrl;

  const athleteAchievements = experience.filter(
    (e) => e.experience_type === 'achievement' || e.experience_type === 'certification'
  );
  const athleteExperiences = experience.filter(
    (e) => e.experience_type === 'work' || e.experience_type === 'education'
  );

  const progressForShowcase = useMemo(
    () =>
      progressPhotos
        .filter((p) => p.before_url && p.after_url)
        .map((p) => ({
          id: p.id,
          before_url: p.before_url as string,
          after_url: p.after_url as string,
          story: p.caption || undefined,
        })),
    [progressPhotos]
  );

  const certificationsMapped = useMemo(
    () =>
      athleteAchievements
        .filter((a) => a.experience_type === 'certification')
        .map((a) => ({
          name: a.title,
          issuer: a.organization,
          year: Number.parseInt(a.start_date?.slice(0, 4) || '0', 10) || new Date().getFullYear(),
        })),
    [athleteAchievements]
  );

  const awardsMapped = useMemo(
    () =>
      athleteAchievements
        .filter((a) => a.experience_type === 'achievement')
        .map((a) => ({
          name: a.title,
          organization: a.organization,
          year: Number.parseInt(a.start_date?.slice(0, 4) || '0', 10) || new Date().getFullYear(),
        })),
    [athleteAchievements]
  );

  const experiencesForProfile: TrainerExperience[] = useMemo(
    () =>
      athleteExperiences.map((e) => ({
        ...e,
        end_date: e.end_date ?? null,
        description: e.description ?? null,
      })),
    [athleteExperiences]
  );

  const displayMetrics = useMemo(
    () => [
      { value: `${profile?.years_experience ?? 0}+`, label: 'Năm kinh nghiệm' },
      { value: String(athleteAchievements.length), label: 'Thành tích' },
      { value: String(gallery.length), label: 'Ảnh' },
    ],
    [profile?.years_experience, athleteAchievements.length, gallery.length]
  );

  const navLabels = useMemo(() => {
    const items: { id: string; label: string }[] = [
      { id: 'about', label: 'Giới thiệu' },
      { id: 'achievements', label: 'Thành tích' },
    ];
    if (packages.length) items.push({ id: 'services', label: 'Gói dịch vụ' });
    if (gallery.length) items.push({ id: 'gallery', label: 'Hình ảnh' });
    if (progressForShowcase.length) items.push({ id: 'progress', label: 'Hành trình' });
    items.push({ id: 'contact', label: 'Liên hệ' });
    return items;
  }, [packages.length, gallery.length, progressForShowcase.length]);

  const athleteNavItems = useMemo(() => profileNavItemsFromLabels(navLabels), [navLabels]);

  const sidebarSocial = useMemo(() => {
    const sl = profile?.social_links;
    if (!sl || typeof sl !== 'object') return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(sl)) {
      if (v && typeof v === 'string') out[k] = v;
    }
    return out;
  }, [profile?.social_links]);

  const handleMessage = useCallback(() => {
    if (!profile?.trainer_id) return;
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/messages?to=${profile.trainer_id}`);
  }, [profile, user, navigate]);

  const portfolioLink = useMemo(() => {
    if (athleteExperiences.length || athleteAchievements.length) {
      return { id: 'achievements', label: 'Xem thành tích' };
    }
    if (packages.length) return { id: 'services', label: 'Xem gói dịch vụ' };
    if (gallery.length) return { id: 'gallery', label: 'Xem ảnh' };
    if (progressForShowcase.length) return { id: 'progress', label: 'Xem hành trình' };
    return { id: 'contact', label: 'Liên hệ' };
  }, [
    athleteExperiences.length,
    athleteAchievements.length,
    packages.length,
    gallery.length,
    progressForShowcase.length,
  ]);

  const primaryCta = useMemo(() => {
    if (!user) {
      return { text: 'Đăng nhập để nhắn tin', action: () => navigate('/login') };
    }
    return { text: 'Nhắn tin', action: handleMessage };
  }, [user, navigate, handleMessage]);

  const seoTitle = useMemo(
    () => (athlete?.full_name ? `${athlete.full_name} — Vận động viên GYMERVIET` : 'Vận động viên | GYMERVIET'),
    [athlete]
  );

  const seoDescription = useMemo(() => {
    if (!athlete?.full_name) return 'Hồ sơ vận động viên trên GYMERVIET.';
    const bio = profile?.bio_short || profile?.bio_long || athlete.bio || '';
    return buildAthleteMetaDescription({
      bio,
      fullName: athlete.full_name,
      specialties: athlete.specialties ?? null,
      location: profile?.location ?? null,
    });
  }, [athlete, profile]);

  if (loading) {
    return (
      <div className="coach-profile-page coach-profile-page--athlete min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="flex gap-10">
            <div className="flex-1">
              <Skeleton className="h-[28rem] w-full rounded-lg" />
            </div>
            <div className="w-[320px] hidden lg:block">
              <Skeleton className="h-[28rem] w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile || !athlete) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-5xl font-extrabold text-gray-100 mb-2">404</div>
        <div className="text-gray-900 font-bold text-lg">Không tìm thấy hồ sơ</div>
        <p className="text-sm text-gray-500 max-w-sm">Vận động viên này có thể đã đổi URL hoặc không còn công khai trên GYMERVIET.</p>
        <Link to="/coaches?type=athlete" className="btn-primary mt-4 px-6">
          ← Về danh sách vận động viên
        </Link>
      </div>
    );
  }

  if (!isAthleteProfile) return null;

  const avatarUrl = athlete.avatar_url;

  const similarForFooter = relatedAthletes.map((a) => ({
    id: a.id,
    slug: a.profile_slug ?? a.slug,
    full_name: a.full_name,
    avatar_url: a.avatar_url,
    specialties: a.specialties,
    base_price_monthly: null as number | null,
    user_type: 'athlete' as const,
  }));

  const packagesForPricing: TrainerPackage[] = packages;

  return (
    <div className="coach-profile-page coach-profile-page--athlete">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="GYMERVIET" />
        <meta property="og:locale" content="vi_VN" />
        {avatarUrl && <meta property="og:image" content={avatarUrl} />}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        {avatarUrl && <meta name="twitter:image" content={avatarUrl} />}
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: athlete.full_name,
          jobTitle: profile.headline || 'Vận động viên',
          description: seoDescription,
          image: avatarUrl || undefined,
          url: canonicalUrl,
          knowsAbout: athlete.specialties ?? [],
          worksFor: { '@type': 'Organization', name: 'GYMERVIET', url: 'https://gymerviet.com' },
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: 'https://gymerviet.com' },
            { '@type': 'ListItem', position: 2, name: 'Vận động viên', item: 'https://gymerviet.com/coaches?type=athlete' },
            { '@type': 'ListItem', position: 3, name: athlete.full_name },
          ],
        })}</script>
      </Helmet>

      <CoachMobileNav
        name={athlete.full_name}
        onMessage={handleMessage}
        primaryCta={primaryCta}
        navItems={navLabels}
        profileVariant="athlete"
      />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <Link
            to="/coaches?type=athlete"
            className="text-[13px] font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            ← Vận động viên
          </Link>
          <div className="flex items-center gap-2">
            {isOwnProfile && (
              <Link
                to="/profile"
                className="inline-flex items-center gap-1.5 h-8 px-3 border border-gray-300 rounded-lg text-[12px] font-semibold text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors"
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
              variant="default"
              titleAttr="Chia sẻ hoặc sao chép liên kết hồ sơ"
              className="bg-white"
            />
            <ShareButton
              url={shareUrl}
              title={seoTitle}
              text={seoDescription}
              label="Facebook"
              variant="facebook"
              titleAttr="Chia sẻ hồ sơ lên Facebook"
              className="bg-white"
            />
          </div>
        </div>
      </div>

      <div className="coach-profile-layout pt-6">
        <ProfileSidebar
          name={athlete.full_name}
          avatarUrl={avatarUrl}
          headline={profile.headline || athlete.specialties?.[0] || null}
          isVerified={!!athlete.is_verified}
          isAcceptingClients={false}
          socialLinks={sidebarSocial}
          location={profile.location || null}
          onContactClick={handleMessage}
          primaryCta={primaryCta}
          showSecondaryCta={false}
          navItems={athleteNavItems}
          profileVariant="athlete"
        />

        <div className="coach-profile-main">
          <div id="section-about" className="profile-section-anchor">
            <ProfileHeroSection
              name={athlete.full_name}
              headline={profile.headline || null}
              location={profile.location || null}
              avatarUrl={avatarUrl}
              specialties={athlete.specialties ?? null}
              bio={athlete.bio ?? null}
              bioLong={profile.bio_long || profile.bio_short || null}
              isVerified={!!athlete.is_verified}
              tagline={undefined}
              metrics={displayMetrics}
              highlights={[]}
              basePriceMonthly={null}
              onMessage={handleMessage}
              primaryCta={primaryCta}
              profileRole="athlete"
              statsPortfolioSectionId={portfolioLink.id}
              statsPortfolioLabel={portfolioLink.label}
              hideStatsPortfolioButton={false}
            />
          </div>

          <div id="section-achievements" className="profile-section-anchor">
            <ProfileExperienceSection
              experiences={experiencesForProfile}
              certifications={certificationsMapped}
              awards={awardsMapped}
              yearsExperience={profile.years_experience ?? null}
              introTitle="Thành tích & kinh nghiệm"
              introSubtitle="Hành trình thi đấu và huấn luyện"
              timelineHeading="Kinh nghiệm"
              emptyStateTitle="Thành tích & kinh nghiệm"
              emptyStateSubtitle="Hành trình thi đấu và huấn luyện"
              emptyHint="Chưa có mốc kinh nghiệm hay thành tích công khai. Nhắn tin trực tiếp nếu bạn muốn tìm hiểu thêm."
            />
          </div>

          {packages.length > 0 && (
            <div id="section-services" className="profile-section-anchor">
              <ProfilePricingSection
                packages={packagesForPricing}
                subscribing={null}
                onSubscribe={() => { }}
                contactOnly
                onContact={handleMessage}
                emptyCopy="Chưa có gói công khai. Nhắn tin để trao đổi về lịch và mức phí phù hợp."
              />
            </div>
          )}

          {gallery.length > 0 && (
            <div id="section-gallery" className="profile-section-anchor">
              <section className="profile-pricing-section">
                <div className="profile-pricing-inner">
                  <h2 className="profile-section-title">
                    Thư viện ảnh
                    <span className="profile-section-title-badge">{gallery.length} ảnh</span>
                  </h2>
                  <p className="profile-section-subtitle">Hình ảnh tập luyện và sự kiện</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {gallery.map((item) => (
                      <a
                        key={item.id}
                        href={item.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-square overflow-hidden rounded-lg bg-gray-100 border border-gray-200 hover:opacity-90 transition-opacity"
                      >
                        <img
                          src={getOptimizedUrl(item.image_url, 400)}
                          srcSet={getSrcSet(item.image_url)}
                          sizes="(max-width: 640px) 50vw, 33vw"
                          alt={item.caption || 'Ảnh trong thư viện'}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {progressForShowcase.length > 0 && (
            <div id="section-progress" className="profile-section-anchor">
              <CoachResultsShowcase
                photos={progressForShowcase}
                eyebrow="Hành trình cá nhân"
                title="Thay đổi hình thể"
                emptyEyebrow="Hành trình cá nhân"
                emptyTitle="Thay đổi hình thể"
                emptyDescription="Chưa có ảnh trước/sau công khai. Bạn có thể nhắn tin để trao đổi thêm trong khung phù hợp."
              />
            </div>
          )}

          <div id="section-contact" className="profile-section-anchor">
            <ProfileContactSection
              coachName={athlete.full_name}
              location={profile.location || null}
              socialLinks={sidebarSocial}
              onMessage={handleMessage}
              primaryCta={primaryCta}
              profileVariant="athlete"
            />
          </div>

          <CoachRelatedFooter coaches={similarForFooter} title="Vận động viên tương tự" />
        </div>
      </div>
    </div>
  );
}
