import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const presentationPath = resolve(process.cwd(), 'src/lib/routePresentation.ts');
const mobileSpecPath = resolve(process.cwd(), 'e2e/mobile-interactions.spec.ts');

const presentationSource = readFileSync(presentationPath, 'utf8');
const mobileSpec = readFileSync(mobileSpecPath, 'utf8');

const requiredRoutes = [
  ['/','home','drive_core_browse'],
  ['/login','login','restore_access'],
  ['/register','register','start_signup'],
  ['/onboarding','onboarding','activate_account'],
  ['/verify-email','verify_email','verify_and_continue'],
  ['/dashboard','dashboard','continue_member_action'],
  ['/profile','profile','improve_profile_value'],
  ['/messages','messages','continue_conversation'],
  ['/coaches','coaches','browse_to_profile'],
  ['/gyms','gyms','find_gym_fast'],
  ['/marketplace','marketplace','browse_to_product'],
  ['/pricing','pricing','drive_upgrade_decision'],
  ['/news','news','build_seo_trust'],
];

const failures = [];

for (const [path, pageId, objective] of requiredRoutes) {
  if (!presentationSource.includes(`'${path}'`)) {
    failures.push(`Missing route presentation entry for ${path}`);
  }
  if (!presentationSource.includes(`'${pageId}'`)) {
    failures.push(`Missing analytics page id ${pageId}`);
  }
  if (!presentationSource.includes(`'${objective}'`)) {
    failures.push(`Missing business objective ${objective}`);
  }
}

if (!mobileSpec.includes('Mobile interaction suite only applies to mobile projects')) {
  failures.push('mobile-interactions.spec.ts is missing the mobile-only project guard');
}

if (failures.length > 0) {
  console.error('Business contract check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Business contract check passed.');
