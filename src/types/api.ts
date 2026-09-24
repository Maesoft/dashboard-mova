export type User = {
  id: number;
  email: string;
  role?: string;
  isActive: boolean;
  routine?: Routine;
  progress?: number;
};

export type AuthResponse = {
  access_token: string;
  user: User;
};

export type Category = {
  id: number;
  name: string;
};

export type Exercise = {
  id: number;
  name: string;
  description?: string;
  videoUrl?: string;
  category: Category;
};

export type Routine = {
  id: number;
  name: string;
};

export type Nutrition = {
  id: string;
  title: string;
  description: string;
  image: string;
  published: boolean;
};

export type ChallengerMediaType = "image" | "video";

export type Challenger = {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: ChallengerMediaType;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RoutineExercise = {
  exercise: Exercise;
  instructions: string;
};

export type RoutineBlock = {
  id: string;
  exercises: RoutineExercise[];
};

export type RoutineDay = {
  day: number;
  blocks: RoutineBlock[];
};
