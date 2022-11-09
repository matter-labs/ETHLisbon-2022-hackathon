import {v4 as uuidv4} from 'uuid';

/**
 * Manages a list of files as cache. Needed as in the redux store we cannot save a File object
 */


/**
 * Defines an item in the FileListCache object (used within its class)
 *
 * @param {string} id - random if for the given file
 * @param {File} file - the File object representing that item
 */
export type FileListCacheItem = {
  id: string,
  file: File
}

/**
 * Manages basic operation around a list of {@link FileListCacheItem[]}
 */
class FileListCacheClass {
  listCache: FileListCacheItem[];

  constructor() {
    this.listCache = [];
  }

  /**
   * Adds a list of files to the cache, returning their IDs in the same order of FileList elements
   * @param {FileList} fileList
   * @return {string[]} the associated IDs with the files
   */
  appendToFileListCache = (fileList: FileList): string[] => {
    let ids: string[] = [];
    for (let fi=0; fi < fileList.length; fi++) {
      let uuid = uuidv4();
      ids.push(uuid);
      this.listCache.push({
        id: uuid,
        file: fileList.item(fi)
      })
    }
    return ids;
  }

  /**
   * Removes one file from the list cache
   * @param {string} id - id of the file to remove
   */
  removeFileFromListCache = (id: string) => {
    this.listCache = this.listCache.filter(f => f.id !== id);
  }

  /**
   * Return the asked File (required by id)
   * @return {File}
   */
  getFileItem = (id: string): File => {
    for (let p of this.listCache) {
      if (p.id === id) return p.file;
    }
    throw new Error("Request a fileId that is not present in the list");
  }
}

let fileListCache: FileListCacheClass = new FileListCacheClass();

/**
 * Returns the reference to the fileListCache class object
 */
export const useFileListCache = (): FileListCacheClass => {
  return fileListCache;
}
