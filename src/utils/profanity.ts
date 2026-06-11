const BAD_WORDS = [
  // 한국어
  '씨발', '시발', '씨팔', '시팔', '씨바', '시바',
  '개새끼', '개세끼', '개쉐끼', '개씨',
  '병신', '빙신', '븅신',
  '지랄', '지X랄',
  '보지', '자지', '보X', '자X',
  '창녀', '창X', '매춘',
  '새끼', '쉐끼',
  '미친놈', '미친년',
  '꺼져', '뒤져', '뒤지',
  '죽어라', '죽여',
  '걸레', '화냥',
  '좆', '졌',
  // 영어
  'fuck', 'f*ck', 'shit', 'bitch', 'asshole', 'bastard',
  'cunt', 'dick', 'cock', 'pussy', 'whore', 'slut',
  'nigger', 'faggot',
];

export function hasProfanity(text: string): boolean {
  const normalized = text.toLowerCase().replace(/\s/g, '');
  return BAD_WORDS.some(word => normalized.includes(word.toLowerCase()));
}

// 한글 완성자(가-힣), 영문자, 숫자 중 하나 이상 포함해야 유효
// 초성(ㄱ-ㅎ)·모음(ㅏ-ㅣ)만 있는 닉네임 차단
export function isValidNickname(text: string): boolean {
  return /[가-힣a-zA-Z0-9]/.test(text);
}
