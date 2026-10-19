import type { SignalResult } from '../../types';
import type { Signal, SignalContext } from '../types';

/**
 * Helper to test if a file in the tree is a root README file.
 */
export function isRootReadme(path: string): boolean {
  return /^readme(\.[a-z0-9_-]+)?$/i.test(path);
}

/**
 * docs.readme_exists:
 * A README file at the repo root, any extension: 3, else 0
 */
export const readmeExistsSignal: Signal = {
  id: 'docs.readme_exists',
  categoryId: 'documentation',
  label: 'README present',
  max: 3,
  compute({ snapshot }: SignalContext): SignalResult {
    const hasReadmeContent = snapshot.readme !== null && snapshot.readme.trim().length > 0;
    const hasReadmeInTree = snapshot.tree.some((f) => isRootReadme(f.path));

    const exists = hasReadmeContent || hasReadmeInTree;
    const earned = exists ? 3 : 0;
    const status = exists ? 'pass' : 'fail';

    return {
      id: 'docs.readme_exists',
      categoryId: 'documentation',
      label: 'README present',
      earned,
      max: 3,
      status,
      evidence: exists
        ? 'README file found at repository root.'
        : 'No README file found at repository root.',
    };
  },
};

export interface ReadmeAnalysis {
  hasTitleIntro: boolean;
  hasInstall: boolean;
  hasUsage: boolean;
  hasVisuals: boolean;
  hasLicense: boolean;
  codeFenceCount: number;
  totalLength: number;
}

const INSTALL_HEADING_REGEX = /^#{1,6}\s+.*(install|setup|getting started|quick ?start)/im;
const INSTALL_CMD_REGEX = /(npm|pnpm|yarn|bun)\s+(install|i|add)|pip3?\s+install|poetry\s+add|cargo\s+add|go\s+get|brew\s+install|gem\s+install|apt-get\s+install|docker\s+pull/i;
const USAGE_HEADING_REGEX = /^#{1,6}\s+.*(usage|example|how to|demo)/im;
const LICENSE_HEADING_REGEX = /^#{1,6}\s+.*license/im;
const LICENSE_BADGE_REGEX = /(!\[.*?license.*?\]\(.*?\)|<img[^>]*license[^>]*>|shields\.io\/[^)\s]*license)/i;
const VISUAL_MEDIA_REGEX = /(!\[.*?\]\(.*?\)|<img\b|<video\b|\.(mp4|webm|mov|svg|png|gif|jpe?g)\b)/i;

/**
 * Analyzes README markdown content for key sections.
 */
export function analyzeReadme(content: string, homepage: string | null): ReadmeAnalysis {
  const totalLength = content.length;

  // Code fences
  const codeFenceMatches = content.match(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g) || [];
  const codeFenceCount = codeFenceMatches.length;

  // Title and intro: >= 20 words in first non-heading paragraph
  // Strip code fences first so code blocks aren't mistaken for paragraphs
  const strippedContent = content.replace(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g, '');
  const paragraphs = strippedContent
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => {
      if (!p) return false;
      // Skip pure headings
      if (/^#{1,6}\s+/.test(p)) return false;
      // Skip pure badge blocks or images
      const withoutBadges = p.replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)|!\[.*?\]\(.*?\)|<img[^>]*>/g, '').trim();
      return withoutBadges.length > 0;
    });

  let hasTitleIntro = false;
  if (paragraphs.length > 0) {
    const firstParagraph = paragraphs[0];
    const cleanWords = firstParagraph
      .replace(/[#*`_~[\]()]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (cleanWords.length >= 20) {
      hasTitleIntro = true;
    }
  }

  // Install or setup: heading or install code fence
  const hasInstallHeading = INSTALL_HEADING_REGEX.test(content);
  let hasInstallCodeFence = false;
  for (const fence of codeFenceMatches) {
    if (INSTALL_CMD_REGEX.test(fence)) {
      hasInstallCodeFence = true;
      break;
    }
  }
  const hasInstall = hasInstallHeading || hasInstallCodeFence;

  // Usage or examples: heading or second code fence
  const hasUsageHeading = USAGE_HEADING_REGEX.test(content);
  const hasUsage =
    hasUsageHeading ||
    (hasInstallCodeFence ? codeFenceCount >= 2 : codeFenceCount >= 1);

  // Visuals: image/video link or homepage URL set
  const hasVisualLink = VISUAL_MEDIA_REGEX.test(content);
  const hasHomepage = Boolean(homepage && homepage.trim().length > 0);
  const hasVisuals = hasVisualLink || hasHomepage;

  // License mention: heading or license badge
  const hasLicense = LICENSE_HEADING_REGEX.test(content) || LICENSE_BADGE_REGEX.test(content);

  return {
    hasTitleIntro,
    hasInstall,
    hasUsage,
    hasVisuals,
    hasLicense,
    codeFenceCount,
    totalLength,
  };
}

/**
 * docs.readme_sections:
 * Title & intro (>=20 words in first paragraph): 2
 * Install or setup: 2
 * Usage or examples: 2
 * Visuals: 1
 * License mention: 1
 * If README < 300 characters, cap total at 2.
 */
export const readmeSectionsSignal: Signal = {
  id: 'docs.readme_sections',
  categoryId: 'documentation',
  label: 'README structure and content',
  max: 8,
  compute({ snapshot }: SignalContext): SignalResult {
    const readmeContent = snapshot.readme ?? '';
    if (!readmeContent.trim()) {
      return {
        id: 'docs.readme_sections',
        categoryId: 'documentation',
        label: 'README structure and content',
        earned: 0,
        max: 8,
        status: 'fail',
        evidence: 'No README content found to evaluate sections.',
      };
    }

    const analysis = analyzeReadme(readmeContent, snapshot.meta.homepage);

    let earned = 0;
    const foundParts: string[] = [];
    const missingParts: string[] = [];

    if (analysis.hasTitleIntro) {
      earned += 2;
      foundParts.push('intro');
    } else {
      missingParts.push('title & intro (>=20 words)');
    }

    if (analysis.hasInstall) {
      earned += 2;
      foundParts.push('install');
    } else {
      missingParts.push('install');
    }

    if (analysis.hasUsage) {
      earned += 2;
      foundParts.push('usage');
    } else {
      missingParts.push('usage');
    }

    if (analysis.hasVisuals) {
      earned += 1;
      foundParts.push('visuals');
    } else {
      missingParts.push('visuals');
    }

    if (analysis.hasLicense) {
      earned += 1;
      foundParts.push('license');
    } else {
      missingParts.push('license');
    }

    const isCapped = analysis.totalLength < 300;
    if (isCapped) {
      earned = Math.min(earned, 2);
    }

    const status = earned === 8 ? 'pass' : earned === 0 ? 'fail' : 'partial';

    let evidence = `README includes ${foundParts.join(', ') || 'no standard sections'} (${foundParts.length}/5).`;
    if (isCapped) {
      evidence = `README is under 300 characters (${analysis.totalLength} chars); score capped at 2.`;
    } else if (missingParts.length > 0) {
      evidence += ` Missing: ${missingParts.join(', ')}.`;
    }

    return {
      id: 'docs.readme_sections',
      categoryId: 'documentation',
      label: 'README structure and content',
      earned,
      max: 8,
      status,
      evidence,
    };
  },
};

/**
 * docs.metadata:
 * Repo description set: 2. At least 3 topics: 1. Max 3.
 */
export const metadataSignal: Signal = {
  id: 'docs.metadata',
  categoryId: 'documentation',
  label: 'Repository metadata',
  max: 3,
  compute({ snapshot }: SignalContext): SignalResult {
    const hasDescription = Boolean(snapshot.meta.description && snapshot.meta.description.trim().length > 0);
    const topicsCount = snapshot.meta.topics ? snapshot.meta.topics.length : 0;
    const hasTopics = topicsCount >= 3;

    let earned = 0;
    if (hasDescription) earned += 2;
    if (hasTopics) earned += 1;

    const status = earned === 3 ? 'pass' : earned === 0 ? 'fail' : 'partial';

    let evidence = '';
    if (hasDescription && hasTopics) {
      evidence = `Description is set and ${topicsCount} topics are tagged.`;
    } else if (hasDescription && !hasTopics) {
      evidence = `Description is set, but only ${topicsCount} topic${topicsCount === 1 ? '' : 's'} tagged (target: 3+).`;
    } else if (!hasDescription && hasTopics) {
      evidence = `No description set, but ${topicsCount} topics are tagged.`;
    } else {
      evidence = 'No description or topics configured.';
    }

    return {
      id: 'docs.metadata',
      categoryId: 'documentation',
      label: 'Repository metadata',
      earned,
      max: 3,
      status,
      evidence,
    };
  },
};

/**
 * docs.folder:
 * A docs/ directory with at least one file, or a homepage URL set: 3, else 0
 */
export const docsFolderSignal: Signal = {
  id: 'docs.folder',
  categoryId: 'documentation',
  label: 'Documentation folder or site',
  max: 3,
  compute({ snapshot }: SignalContext): SignalResult {
    const hasDocsDir = snapshot.tree.some((f) => /^docs\//i.test(f.path));
    const hasHomepage = Boolean(snapshot.meta.homepage && snapshot.meta.homepage.trim().length > 0);

    const passes = hasDocsDir || hasHomepage;
    const earned = passes ? 3 : 0;
    const status = passes ? 'pass' : 'fail';

    let evidence = '';
    if (hasDocsDir && hasHomepage) {
      evidence = 'Documentation directory (docs/) and homepage URL are both present.';
    } else if (hasDocsDir) {
      evidence = 'Documentation directory (docs/) found with documentation files.';
    } else if (hasHomepage) {
      evidence = `Homepage URL is configured (${snapshot.meta.homepage}).`;
    } else {
      evidence = 'No docs/ directory or homepage URL found.';
    }

    return {
      id: 'docs.folder',
      categoryId: 'documentation',
      label: 'Documentation folder or site',
      earned,
      max: 3,
      status,
      evidence,
    };
  },
};

/**
 * Calculates comment density across sampled source files.
 * Returns { commentLines, nonBlankLines, density }
 */
export function calculateCommentDensity(sampledSources: { path: string; content: string }[]): {
  commentLines: number;
  nonBlankLines: number;
  density: number;
} {
  let totalComments = 0;
  let totalNonBlank = 0;

  for (const file of sampledSources) {
    const lines = file.content.split(/\r?\n/);
    let inBlockComment = false;
    let blockEndMarker = '';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line === '') continue;

      totalNonBlank++;

      if (inBlockComment) {
        totalComments++;
        if (line.includes(blockEndMarker)) {
          inBlockComment = false;
        }
        continue;
      }

      // Check block comment starters
      if (line.startsWith('/*')) {
        totalComments++;
        if (!line.includes('*/') || line === '/*') {
          inBlockComment = true;
          blockEndMarker = '*/';
        }
        continue;
      }

      if (line.startsWith('"""') || line.startsWith("'''")) {
        totalComments++;
        const marker = line.slice(0, 3);
        const rest = line.slice(3);
        if (!rest.includes(marker)) {
          inBlockComment = true;
          blockEndMarker = marker;
        }
        continue;
      }

      if (line.startsWith('<!--')) {
        totalComments++;
        if (!line.includes('-->')) {
          inBlockComment = true;
          blockEndMarker = '-->';
        }
        continue;
      }

      // Single line comments
      if (
        line.startsWith('//') ||
        line.startsWith('#') ||
        line.startsWith('--') ||
        line.startsWith('*')
      ) {
        totalComments++;
      }
    }
  }

  const density = totalNonBlank === 0 ? 0 : totalComments / totalNonBlank;
  return {
    commentLines: totalComments,
    nonBlankLines: totalNonBlank,
    density,
  };
}

/**
 * docs.comments:
 * Comment-line density d over sampled sources (comment lines / non-blank lines):
 * 0.05 <= d <= 0.35 gives 3;
 * 0.02 <= d < 0.05 or d > 0.35 gives 1.5;
 * else 0.
 * No source files: na.
 */
export const commentsSignal: Signal = {
  id: 'docs.comments',
  categoryId: 'documentation',
  label: 'Inline comment density',
  max: 3,
  compute({ snapshot }: SignalContext): SignalResult {
    if (!snapshot.sampledSources || snapshot.sampledSources.length === 0) {
      return {
        id: 'docs.comments',
        categoryId: 'documentation',
        label: 'Inline comment density',
        earned: 0,
        max: 3,
        status: 'na',
        evidence: 'No source files available to sample for comment density.',
      };
    }

    const { commentLines, nonBlankLines, density } = calculateCommentDensity(snapshot.sampledSources);

    if (nonBlankLines === 0) {
      return {
        id: 'docs.comments',
        categoryId: 'documentation',
        label: 'Inline comment density',
        earned: 0,
        max: 3,
        status: 'na',
        evidence: 'Sampled source files contained no code lines to measure.',
      };
    }

    const pct = (density * 100).toFixed(1);

    let earned = 0;
    if (density >= 0.05 && density <= 0.35) {
      earned = 3;
    } else if ((density >= 0.02 && density < 0.05) || density > 0.35) {
      earned = 1.5;
    } else {
      earned = 0;
    }

    const status = earned === 3 ? 'pass' : earned === 0 ? 'fail' : 'partial';

    let evidence = '';
    if (earned === 3) {
      evidence = `Comment density is ${pct}% (${commentLines}/${nonBlankLines} lines), within the healthy 5–35% range.`;
    } else if (earned === 1.5) {
      evidence = `Comment density is ${pct}% (${commentLines}/${nonBlankLines} lines), ${
        density < 0.05 ? 'slightly below the 5% threshold' : 'above the 35% threshold'
      }.`;
    } else {
      evidence = `Comment density is ${pct}% (${commentLines}/${nonBlankLines} lines), significantly below the 5% threshold.`;
    }

    return {
      id: 'docs.comments',
      categoryId: 'documentation',
      label: 'Inline comment density',
      earned,
      max: 3,
      status,
      evidence,
    };
  },
};
