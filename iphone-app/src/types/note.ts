export type Note = {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
};

export type NoteDraft = Pick<Note, 'title' | 'body'>;
