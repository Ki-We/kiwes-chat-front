export const adjective = [
  "귀여운",
  "즐거운",
  "웃긴",
  "이상한",
  "재밌는",
  "슬픈",
  "예쁜",
  "멋진",
  "짜증난",
  "서러운",
  "실증난",
];
export const noun = [
  "강아지",
  "고양이",
  "개미",
  "사자",
  "호랑이",
  "하마",
  "공룡",
  "코끼리",
  "돼지",
  "병아리",
  "토끼",
  "양",
];

export const logout = () => {
  localStorage.removeItem("token");
  location.href = "/";
};
