export type Post = {
  id: string;
  uid: string;
  title: string;
  content?: string;
  isPublic: boolean;
  thumbUrl?: string;
  thumbPath?: string;
  createdAt?: { seconds: number; nanoseconds: number } | null;
  updatedAt?: { seconds: number; nanoseconds: number } | null;
};

