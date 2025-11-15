// export function validateFiles(files: any) {
//   if (!files?.adhaarFrontFile || !files?.adhaarBackFile) {
//     throw new Error('Both front and back Aadhaar images are required.');
//   }
// }

// // export function isAdhaar(text1: string, text2: string) {
// //   if (!text1.includes('DOB') && !text2.includes('Address')) {
// //     throw new Error('Provided images may not be valid Aadhaar card images.');
// //   }
// // }

// export function isAdhaar(text1: string, text2: string) {
//   const hasDOB = text1.includes('DOB');
//   const hasAddress = text2.includes('Address');

//   if (!hasDOB && !hasAddress) {
//     const error: any = new Error('Uploaded images are not valid Aadhaar card images.');
//     error.statusCode = 400;
//     throw error;
//   }
// }

//..............................................................................thazhe sherikkm illath


// export function validateFiles(files: any) {
//   if (!files?.adhaarFrontFile || !files?.adhaarBackFile) {
//     throw new Error('Both front and back Aadhaar images are required.');
//   }
// }

// export function isAdhaar(frontText: string, backText: string) {
//   console.log(backText,"backtext");
  
  
//   const frontIndicators = [
//     'DOB', 'Date of Birth', 'MALE', 'FEMALE', 'Name', 'Year of Birth',
//     'Address', 'PIN', 'Pincode', 'Pin Code', 'Father', 'Mother', 'Husband'

//   ];
  
  
//   const backIndicators = [
//     'Address', 'PIN', 'Pincode', 'Pin Code', 'Father', 'Mother', 'Husband',
//      'DOB', 'Date of Birth', 'MALE', 'FEMALE', 'Name', 'Year of Birth'
    
//   ];
  
//   const isFrontValid = frontIndicators.some(indicator => 
//     frontText.toUpperCase().includes(indicator.toUpperCase())
//   );
  
//   const isBackValid = backIndicators.some(indicator => 
//     backText.toUpperCase().includes(indicator.toUpperCase())
//   );
  
  
//   if (!isFrontValid || !isBackValid) {
//     const error: any = new Error('Both uploaded images must be valid Aadhaar card images.');
//     error.statusCode = 400;
//     throw error;
//   }



  
  
//   const frontHasDOB = frontText.toUpperCase().includes('DOB') || 
//                      frontText.toUpperCase().includes('DATE OF BIRTH') 
//   const backHasAddress = backText.toUpperCase().includes('ADDRESS') 
  
//   if (!frontHasDOB && !backHasAddress) {
//     const error: any = new Error('Please upload the correct front and back images of the Aadhaar card.');
//     error.statusCode = 400;
//     throw error;
//   }
// }



/////////////////////////////////////////////////newwwwwwwwwwwwwwwwwwwwwww




// Enhanced validation functions with better security

export function validateFiles(files: any) {
  if (!files?.adhaarFrontFile || !files?.adhaarBackFile) {
    const error: any = new Error('Both front and back Aadhaar images are required.');
    error.statusCode = 400;
    throw error;
  }

  // Additional file validation
  const frontFile = files.adhaarFrontFile[0];
  const backFile = files.adhaarBackFile[0];

  if (!frontFile || !backFile) {
    const error: any = new Error('Invalid file upload. Please try again.');
    error.statusCode = 400;
    throw error;
  }
}

// Enhanced Aadhaar validation with better security
export async function isAdhaar(frontText: string, backText: string): Promise<{isValid: boolean, reason?: string, confidence: number}> {
  console.log('Starting Aadhaar validation...');
  
  try {
    // Step 1: Basic text quality check
    if (!frontText || !backText || frontText.length < 50 || backText.length < 50) {
      return {
        isValid: false,
        reason: 'Poor OCR quality. Please upload clearer images.',
        confidence: 0
      };
    }

    // Step 2: Check for Aadhaar-specific indicators
    const validationResult = validateAadhaarIndicators(frontText, backText);
    if (!validationResult.isValid) {
      return validationResult;
    }

    // Step 3: Validate Aadhaar number presence and format
    const aadhaarValidation = validateAadhaarNumber(frontText, backText);
    if (!aadhaarValidation.isValid) {
      return aadhaarValidation;
    }

    // Step 4: Check for mandatory fields
    const mandatoryFieldsValidation = validateMandatoryFields(frontText, backText);
    if (!mandatoryFieldsValidation.isValid) {
      return mandatoryFieldsValidation;
    }

    // Step 5: Security checks (prevent fake/tampered cards)
    const securityValidation = performSecurityChecks(frontText, backText);
    if (!securityValidation.isValid) {
      return securityValidation;
    }

    return {
      isValid: true,
      confidence: calculateConfidenceScore(frontText, backText)
    };

  } catch (error) {
    console.error('Aadhaar validation error:', error);
    return {
      isValid: false,
      reason: 'Internal validation error. Please try again.',
      confidence: 0
    };
  }
}

function validateAadhaarIndicators(frontText: string, backText: string) {
  const frontUpper = frontText.toUpperCase();
  const backUpper = backText.toUpperCase();

  // Essential Aadhaar indicators
  const essentialIndicators = {
    front: [
      'DOB', 'DATE OF BIRTH', 'YEAR OF BIRTH',
      'MALE', 'FEMALE', 'GENDER',
      'GOVERNMENT OF INDIA', 'GOI'
    ],
    back: [
      'ADDRESS', 'PIN', 'PINCODE'
    ]
  };

  const frontMatches = essentialIndicators.front.filter(indicator =>
    frontUpper.includes(indicator)
  );
  const backMatches = essentialIndicators.back.filter(indicator =>
    backUpper.includes(indicator)
  );

  // Case 1: Neither looks like Aadhaar
  if (frontMatches.length === 0 && backMatches.length === 0) {
    return {
      isValid: false,
      reason: 'These do not appear to be Aadhaar card images. Please upload valid Aadhaar front and back images.',
      confidence: 0
    };
  }

  // Case 2: One looks like Aadhaar, the other does not
  if ((frontMatches.length > 0 && backMatches.length === 0) || 
      (frontMatches.length === 0 && backMatches.length > 0)) {
    return {
      isValid: false,
      reason: 'Both front and back images must be valid Aadhaar card images.',
      confidence: 0
    };
  }

  // Case 3: Images swapped
  const frontHasAddress = frontUpper.includes('ADDRESS');
  const backHasDOB = backUpper.includes('DOB') || backUpper.includes('DATE OF BIRTH');

  if (frontHasAddress && !backHasDOB) {
    return {
      isValid: false,
      reason: 'Please upload correct front and back image of Aadhaar.',
      confidence: 0
    };
  }

  return { isValid: true, confidence: 75 };
}

function validateAadhaarNumber(frontText: string, backText: string) {
  // Look for 12-digit Aadhaar number pattern
  const aadhaarPattern = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
  
  const frontMatches = frontText.match(aadhaarPattern) || [];
  const backMatches = backText.match(aadhaarPattern) || [];
  
  const allMatches = [...frontMatches, ...backMatches];
  
  if (allMatches.length === 0) {
    return {
      isValid: false,
      reason: 'No valid Aadhaar number found in the images.',
      confidence: 0
    };
  }

  // Validate each potential Aadhaar number
  const validNumbers = allMatches.filter(num => {
    const digits = num.replace(/\s|-/g, '');
    return digits.length === 12 && validateAadhaarChecksum(digits);
  });

  if (validNumbers.length === 0) {
    return {
      isValid: false,
      reason: 'Invalid Aadhaar number format detected.',
      confidence: 0
    };
  }

  return { isValid: true, confidence: 85 };
}

function validateMandatoryFields(frontText: string, backText: string) {
  const requiredFields = [
    { field: 'name', patterns: [/[A-Z][a-zA-Z\s]{2,30}/], text: frontText },
    { field: 'dob', patterns: [/\b\d{2}\/\d{2}\/\d{4}\b/], text: frontText },
    { field: 'gender', patterns: [/\b(male|female)\b/i], text: frontText },
    { field: 'address', patterns: [/address[:\s]/i], text: backText },
    { field: 'pincode', patterns: [/\b\d{6}\b/], text: backText }
  ];

  const missingFields = requiredFields.filter(field => 
    !field.patterns.some(pattern => pattern.test(field.text))
  );

  if (missingFields.length > 2) {
    return {
      isValid: false,
      reason: `Missing essential information: ${missingFields.map(f => f.field).join(', ')}. Please upload clearer images.`,
      confidence: 0
    };
  }

  return { isValid: true, confidence: 80 };
}

function performSecurityChecks(frontText: string, backText: string) {
  const suspiciousPatterns = [
    /test|sample|demo|fake|copy|duplicate/i,
    /\*{4,}/, // Multiple asterisks (common in fake cards)
    /x{4,}/i, // Multiple X's
    /_{4,}/, // Multiple underscores
    /(000|111|222|333|444|555|666|777|888|999){3,}/ // Repeated digit patterns
  ];

  const combinedText = frontText + ' ' + backText;
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(combinedText)) {
      return {
        isValid: false,
        reason: 'Security validation failed. Please upload original Aadhaar card images only.',
        confidence: 0
      };
    }
  }

  // Check for reasonable text length and variety
  const uniqueChars = new Set(combinedText.toLowerCase().replace(/\s/g, '')).size;
  if (uniqueChars < 15) {
    return {
      isValid: false,
      reason: 'Image quality insufficient for processing. Please upload clearer images.',
      confidence: 0
    };
  }

  return { isValid: true, confidence: 90 };
}

// Simple Aadhaar checksum validation (Verhoeff algorithm)
function validateAadhaarChecksum(aadhaarNumber: string): boolean {
  // Verhoeff algorithm implementation for Aadhaar validation
  const d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
  ];

  

  const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
  ];

  const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

  let c = 0;
  const reversedNumber = aadhaarNumber.split('').reverse().join('');

  for (let i = 0; i < reversedNumber.length; i++) {
    const digit = parseInt(reversedNumber[i]);
    c = d[c][p[i % 8][digit]];
  }

  return c === 0;
}

function calculateConfidenceScore(frontText: string, backText: string): number {
  let score = 0;
  
  // Check for various quality indicators
  const indicators = [
    { pattern: /government\s+of\s+india/i, weight: 15, text: frontText + backText },
    { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, weight: 20, text: frontText + backText },
    { pattern: /\b\d{2}\/\d{2}\/\d{4}\b/, weight: 15, text: frontText },
    { pattern: /\b(male|female)\b/i, weight: 10, text: frontText },
    { pattern: /address[:\s]/i, weight: 15, text: backText },
    { pattern: /\b\d{6}\b/, weight: 10, text: backText },
    { pattern: /[A-Z][a-zA-Z\s]{3,30}/, weight: 10, text: frontText }
  ];

  indicators.forEach(indicator => {
    if (indicator.pattern.test(indicator.text)) {
      score += indicator.weight;
    }
  });

  // Text quality bonus
  const combinedText = frontText + backText;
  const avgWordLength = combinedText.split(/\s+/).reduce((acc, word) => acc + word.length, 0) / combinedText.split(/\s+/).length;
  
  if (avgWordLength > 3 && avgWordLength < 8) {
    score += 5; // Good OCR quality indicator
  }

  return Math.min(score, 100);
}
