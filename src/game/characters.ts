import charF1 from '../assets/images/characters/char-f-1.webp';
import charF2 from '../assets/images/characters/char-f-2.webp';
import charF3 from '../assets/images/characters/char-f-3.webp';
import charM1 from '../assets/images/characters/char-m-1.webp';
import charM2 from '../assets/images/characters/char-m-2.webp';
import charM3 from '../assets/images/characters/char-m-3.webp';

export interface Character {
  id: string;
  src: string;
  label: string;
}

export const CHARACTERS: Character[] = [
  { id: 'f1', src: charF1, label: '포니테일' },
  { id: 'f2', src: charF2, label: '산책러' },
  { id: 'f3', src: charF3, label: '등산러' },
  { id: 'm1', src: charM1, label: '트레커' },
  { id: 'm2', src: charM2, label: '캠퍼' },
  { id: 'm3', src: charM3, label: '러너' },
];

const CHAR_KEY = 'hamkke-walk-character';
export const getSavedCharId = (): string => localStorage.getItem(CHAR_KEY) ?? 'f1';
export const saveCharId = (id: string): void => { localStorage.setItem(CHAR_KEY, id); };
