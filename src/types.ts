export interface Experience {
  title: string;
  company: string;
  companyNote?: string;
  dates: string;
  bullets: string[];
}

export interface Project {
  id: string;
  name: string;
  stack: string;
  description: string;
  link?: string;
  linkLabel?: string;
  hackathonLabel?: string;
}

export interface Education {
  degree: string;
  school: string;
  schoolDetail?: string;
  dates: string;
}

export interface SkillGroup {
  label: string;
  skills: string[];
  variant?: 'default' | 'learning';
}

export interface HumanLanguage {
  name: string;
  level: string;
}

export interface Profile {
  name: string;
  role: string;
  email: string;
  website: string;
  github: string;
  linkedin: string;
  city: string;
  summary: string;
  experience: Experience[];
  projects: Project[];
  education: Education;
  skillGroups: SkillGroup[];
  languages: HumanLanguage[];
  interests: string[];
}

export type ApplicationStatus =
  | 'drafting'
  | 'ready'
  | 'sent'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export interface CoverLetter {
  recipientOrg: string;
  recipientName?: string;
  date: string;
  subjectRole: string;
  paragraphs: string[];
}

export type AppLanguage = 'en' | 'de';
export type AppFont = 'sans' | 'serif' | 'mono';

export interface ApplicationConfig {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  language?: AppLanguage;
  font?: AppFont;
  appliedDate?: string;
  url?: string;
  summaryOverride?: string;
  featuredProjectIds?: string[];
  skillGroupsOverride?: SkillGroup[];
  coverLetter?: CoverLetter;
}
