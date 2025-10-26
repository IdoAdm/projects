
export enum BusinessNiche {
  IceBathInstructor = 'Ice Bath Instructor',
  YogaInstructor = 'Yoga Instructor',
  PilatesInstructor = 'Pilates Instructor',
  PersonalTrainer = 'Personal Trainer',
  MeditationCoach = 'Meditation Coach',
  MassageTherapist = 'Massage Therapist',
  HolisticHealthTherapist = 'Holistic Health Therapist',
  WellnessCoach = 'Wellness Coach',
  RunningCoach = 'Running Coach',
  HikingCoach = 'Hiking Coach',
}

export interface FormData {
  businessName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  socialMedia?: string;
  businessNiche: BusinessNiche | '';
  logo: File | null;
}

export type FormErrors = {
  [key in keyof FormData]?: string;
};
