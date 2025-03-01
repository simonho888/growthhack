export interface Experience {
  id: string;
  date: string;
  negativeExperience: string;
  lesson?: string;
  lessonDate?: string;
  benefit?: string;
  benefitDate?: string;
}

export enum ExperienceStage {
  INITIAL = 'initial',
  LESSON = 'lesson',
  BENEFIT = 'benefit',
  COMPLETED = 'completed'
}

export function getExperienceStage(experience: Experience): ExperienceStage {
  if (!experience.lesson) {
    return ExperienceStage.INITIAL;
  } else if (!experience.benefit) {
    return ExperienceStage.LESSON;
  } else {
    return ExperienceStage.COMPLETED;
  }
}

export function isReadyForLesson(experience: Experience): boolean {
  if (experience.lesson) return false;
  
  const creationDate = new Date(experience.date);
  const oneWeekLater = new Date(creationDate);
  oneWeekLater.setDate(creationDate.getDate() + 7);
  
  return new Date() >= oneWeekLater;
}

export function isReadyForBenefit(experience: Experience): boolean {
  if (!experience.lesson || experience.benefit) return false;
  
  const lessonDate = new Date(experience.lessonDate!);
  const oneMonthLater = new Date(lessonDate);
  oneMonthLater.setMonth(lessonDate.getMonth() + 1);
  
  return new Date() >= oneMonthLater;
}
