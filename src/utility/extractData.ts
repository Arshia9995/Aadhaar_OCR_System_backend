function extractData(data: string[] | null) {
  return data?.[0] ?? '';
}

export function generateData(text1: string, text2: string) {
  return {
    name: extractName(text1),
    dob: extractDOB(text1),
    gender: extractGender(text1),
    address: extractAddress(text2),
    aadhaarNumber: extractAadhaarNumber(text1),
    pincode: extractPincode(text2),
  };
}

export function extractName(text: string) {
  const lines = text.split('\n').map(line => line.trim());
  const nameCandidates = lines.filter(line =>
    /^[A-Z][a-zA-Z]{2,}[A-Z][a-z]{2,}$/.test(line.replace(/\s/g, '')) && 
    !line.toLowerCase().includes("government") &&
    !line.toLowerCase().includes("india") &&
    !/\d/.test(line)
  );
  return extractData(nameCandidates);
}


export function extractDOB(text: string) {
  const dobRegex = /\b\d{2}\/\d{2}\/\d{4}\b/g;
  return extractData(text.match(dobRegex));
}

export function extractGender(text: string) {
  const genderRegex = /\b(Male|Female)\b/i;
  return extractData(text.match(genderRegex));
}

export function extractAadhaarNumber(text: string) {
  const matches = text.match(/\d{4}[\s-]?\d{4}[\s-]?\d{4}/g);
  if (!matches) return '';

  const likelyAadhaar = matches.find(match =>
    !text.includes('VID') && !text.includes('Virtual')
  );

  return likelyAadhaar?.replace(/\s+/g, '') ?? matches[0];
}



export function extractPincode(text: string) {
  const pinMatch = text.match(/\b\d{6}\b/);
  return extractData(pinMatch);
}


export function extractAddress(text: string): string {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

  // Find the starting index of the Address block
  const addressIndex = lines.findIndex(line =>
    /Address[:]?/i.test(line)
  );

  if (addressIndex === -1) return '';

  // Gather lines starting from "Address" up to the line that contains the pincode
  const addressLines: string[] = [];
  for (let i = addressIndex + 1; i < lines.length; i++) {
    const line = lines[i];

    // Stop if a 6-digit pincode is found
    if (/\b\d{6}\b/.test(line)) {
      addressLines.push(line);
      break;
    }

    // Skip uppercase garbage or lines without letters/numbers
    if (
      /^[^a-zA-Z0-9]*$/.test(line) || // line has only symbols
      /^[A-Z\s]{10,}$/.test(line)     // line is mostly uppercase noise
    ) continue;

    addressLines.push(line);
  }

  // Join and clean up
  return addressLines
    .join(', ')
    .replace(/[^a-zA-Z0-9,/\- ]/g, '')  
    .replace(/\s{2,}/g, ' ')            
    .replace(/,+/g, ',')               
    .replace(/\s+,/g, ',')             
    .trim();
}


