export const OFFICIAL_ENQUIRY_EMAIL = "ask.darulifa.irshadussaaileen@gmail.com";

export function getOfficialEmailCopy(language: "ur" | "en") {
  const urdu = language === "ur";
  return {
    sharedLabel: urdu ? "تحریری رہنمائی کے لیے ای میل" : "Written enquiries by email",
    sharedDetail: urdu
      ? "عمومی سوالات اور رہنمائی کے لیے ہمارے علمی رہنمائی ڈیسک کو لکھیں۔"
      : "Write to our scholarly guidance desk for general enquiries and guidance.",
    cardTitle: urdu ? "تحریری رابطہ" : "Written enquiries",
    cardDescription: urdu
      ? "عمومی رہنمائی کے لیے ای میل کے ذریعے علمی رہنمائی ڈیسک سے رابطہ کریں۔"
      : "Contact the scholarly guidance desk by email for general guidance.",
    mailtoHref: `mailto:${OFFICIAL_ENQUIRY_EMAIL}`,
  };
}
