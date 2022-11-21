export interface Beep {
  id: string;
  content: string;
  createdAt: number;
  likeCount: number;
  liked: boolean;
  author: {
    username: string;
    picture: string;
  };
}
