/**
 * Generates the sha-256 hash of a given File
 *
 * @param {File} file - the file you want the hash
 */
export const fileToHash = async (file: File): Promise<string> => {
  // get byte array of file
  let buffer = await file.arrayBuffer();
  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // convert bytes to hex string
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Merges two FileList objects and returns a new FileList object
 * @param {FileList} fileListA The first FileList object
 * @param {FileList} fileListB The second FileList object
 */
export const mergeFileLists = (fileListA: FileList, fileListB: FileList): FileList => {
  const dataTransfer = new DataTransfer();
  for (let i = 0; i < fileListA.length; i++) {
    dataTransfer.items.add(fileListA[i]);
  }
  for (let i = 0; i < fileListB.length; i++) {
    dataTransfer.items.add(fileListB[i]);
  }
  return dataTransfer.files;
}


/**
 * Merges two FileList objects and returns a new FileList object
 * @param {FileList} fileList The FileList object
 * @param {number} idItem The id of the item to remove (position)
 */
export const removeFromFileList = (fileList: FileList, idItem: number): FileList => {
  const dataTransfer = new DataTransfer();
  for (let i = 0; i < fileList.length; i++) {
    if (i !== idItem) dataTransfer.items.add(fileList[i]);
  }
  return dataTransfer.files;
}

