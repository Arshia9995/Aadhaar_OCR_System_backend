// // backend/src/utils/parseAadhaarText.ts

// export const parseAadhaarText = (text: string) => {
//   const result: any = {};

//   const uidMatch = text.match(/\d{4}[\s-]?\d{4}[\s-]?\d{4}/);
//   result.uid = uidMatch?.[0] ?? 'Not Found';

//   const nameMatch = text.match(/Name[:\s]*([A-Za-z ]{2,})/i);
//   result.Name = nameMatch?.[1]?.trim() ?? 'Not Found';

//   const dobMatch = text.match(/(\d{2}[\/-]\d{2}[\/-]\d{4})/);
//   result.DOB = dobMatch?.[1] ?? 'Not Found';

//   const genderMatch = text.match(/\b(Male|Female)\b/i);
//   result.Gender = genderMatch?.[0]?.toUpperCase() ?? 'Not Found';

//   const pincodeMatch = text.match(/\b\d{6}\b/);
//   result.pincode = pincodeMatch?.[0] ?? 'Not Found';

//   const addressStart = text.search(/Address[:\s]|D\/O|W\/O/i);
//   if (addressStart !== -1) {
//     const sliced = text.slice(addressStart).split('\n');
//     result.address = sliced.slice(0, 5).filter(l => !/VID|QR|www|UIDAI/i.test(l)).join(', ');
//   } else {
//     result.address = 'Not Found';
//   }

//   return {
//     status: true,
//     data: result,
//     message: 'Parsed Aadhaar fields successfully',
//   };
// };



function extractData(data: string[] | null) {
  if (data === null) {
    return "";
  }

  return data[0];
}

export function generateData(text1: string, text2: string) {
  return {
    name: extractName(text1),
    dob: extractDOB(text1),
    gender: extractGender(text1),
    address: extractAdress(text2),
    aadhaarNumber: extractAdhaarNumber(text1),
    pincode: extractPincode(text2),
  };
}

export function extractDOB(ocrText: string) {
  const dobRegex = /\b\d{2}\/\d{2}\/\d{4}\b/g;
  return extractData(ocrText.match(dobRegex));
}
export function extractAdhaarNumber(ocrText: string) {
  const adhaarRegex = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;

  return extractData(ocrText.match(adhaarRegex));
}
export function extractGender(ocrText: string) {
  const genderRegex = /(Male|Female|male|female)/g;
  return extractData(ocrText.match(genderRegex));
}
export function extractPincode(ocrText: string) {
  const pincodeRegex = /\b\d{6}\b(?!\d)/g;
  return extractData(ocrText.match(pincodeRegex));
}
export function extractAdress(ocrText: string) {
  const adressRegex = /(?<=Address:\s*?)(\b[\s\S]+?)(?=\b\d{6}\b)/i;
  return extractData(ocrText.match(adressRegex))
    .replace(/[-\n]+/g, " ")
    .replace(/,\s*,+/g, ",")
    .replace(/[^a-zA-Z0-9]{2,}/g, " ")
    .replace(/\b[a-zA-Z]{1,2}\b/g, "")
    .replace(/\b\s+\b/g, ",")
    .trim();
}
export function extractName(ocrText: string) {
  const nameRegex = /([a-zA-Z]{4,})(?=\s+DOB\b)/;
  return extractData(ocrText.match(nameRegex));
}

export function extractGovermentTextBack(ocrText: string) {
  const regex = /\b(Unique\s?Identification\s?Authority\s?of\s?India)\b/i;
  return extractData(ocrText.match(regex));
}