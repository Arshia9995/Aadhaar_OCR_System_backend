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




export function validateFiles(files: any) {
  if (!files?.adhaarFrontFile || !files?.adhaarBackFile) {
    throw new Error('Both front and back Aadhaar images are required.');
  }
}

export function isAdhaar(frontText: string, backText: string) {
  console.log(backText,"backtext");
  
  // Check if front image contains typical Aadhaar front side indicators
  const frontIndicators = [
    'DOB', 'Date of Birth', 'MALE', 'FEMALE', 'Name', 'Year of Birth',
    'Address', 'PIN', 'Pincode', 'Pin Code', 'Father', 'Mother', 'Husband'

  ];
  
  // Check if back image contains typical Aadhaar back side indicators  
  const backIndicators = [
    'Address', 'PIN', 'Pincode', 'Pin Code', 'Father', 'Mother', 'Husband',
     'DOB', 'Date of Birth', 'MALE', 'FEMALE', 'Name', 'Year of Birth'
    
  ];
  
  const isFrontValid = frontIndicators.some(indicator => 
    frontText.toUpperCase().includes(indicator.toUpperCase())
  );
  
  const isBackValid = backIndicators.some(indicator => 
    backText.toUpperCase().includes(indicator.toUpperCase())
  );
  
  // Both images must be valid Aadhaar images
  if (!isFrontValid || !isBackValid) {
    const error: any = new Error('Both uploaded images must be valid Aadhaar card images.');
    error.statusCode = 400;
    throw error;
  }



  
  // Additional check: Ensure they are actually front and back (not two front or two back)
  const frontHasDOB = frontText.toUpperCase().includes('DOB') || 
                     frontText.toUpperCase().includes('DATE OF BIRTH') 
  const backHasAddress = backText.toUpperCase().includes('ADDRESS') 
  
  if (!frontHasDOB && !backHasAddress) {
    const error: any = new Error('Please upload the correct front and back images of the Aadhaar card.');
    error.statusCode = 400;
    throw error;
  }
}