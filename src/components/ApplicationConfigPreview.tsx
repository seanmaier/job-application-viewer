import type { ApplicationConfig, CoverLetter } from '../types';
import { getProfile } from '../data/profiles';
import { CVDocument } from './cv/CVDocument';
import { CoverLetterDocument } from './cover-letter/CoverLetterDocument';

interface Props {
  config: ApplicationConfig;
}

/** Renders the actual CV/cover-letter documents a config would produce, for confirming an import before applying it. */
export function ApplicationConfigPreview({ config }: Props) {
  const profile = getProfile(config.language);

  return (
    <div className="py-8 px-5">
      <CVDocument profile={profile} application={config} />
      {config.coverLetter && (
        <CoverLetterDocument
          profile={profile}
          application={{ ...config, coverLetter: config.coverLetter as CoverLetter }}
          paginate
        />
      )}
    </div>
  );
}
