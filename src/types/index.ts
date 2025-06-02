export type Locale = 'en' | 'mr' | 'hi';

export type Translations = {
  [key: string]: string | NestedTranslations;
};

export type NestedTranslations = {
  [key: string]: string | NestedTranslations;
};

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
}
