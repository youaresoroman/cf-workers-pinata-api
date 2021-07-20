export default class {
  constructor(key, secret) {
    this.options = {
      method: "GET",
      headers: {
        pinata_api_key: key,
        pinata_secret_api_key: secret,
        "content-type": "application/json;charset=UTF-8",
      },
    };
  }

  handleResult(data) {
    return new Promise((resolve, reject) => {
      try {
        const resultData = JSON.parse(data);
        if (typeof resultData == "object" && resultData.rows || resultData.ipfsHash || resultData.count || resultData.IpfsHash) {
          resolve({
            status: "succeed",
            content: resultData
          })
        } else {
          reject({
            status: "failed",
            content: resultData.error ? resultData.error : resultData
          })
        }
      } catch (err) {
        if (typeof data == "string" && data == "OK") {
          resolve({
            status: "succeed",
            content: "OK"
          })
        } else {
          reject({
            status: "failed",
            content: data
          })
        }
      }
    })
  }

  async hashMetadata(hash, metadata) {
    return new Promise(async (resolve, reject) => {
      const options = {
        ...this.options,
        method: "PUT",
        body: JSON.stringify({
          ipfsPinHash: hash,
          keyvalues: metadata
        })
      }
      await fetch("https://api.pinata.cloud/pinning/hashMetadata", options)
        .then((response) => response.text())
        .then((data) => {
          this.handleResult(data)
            .then((result) => {
              resolve(result)
            })
            .catch((result) => {
              reject(result)
            })
        })
        .catch(() => {
          reject({
            status: "failed",
            content: "Connection failed"
          })
        });
    });
  }

  async pinJobs() {
    return new Promise(async (resolve, reject) => {
      const options = {
        ...this.options,
        method: "GET"
      }
      await fetch("https://api.pinata.cloud/pinning/pinJobs?sort=DESC&limit=1000", options)
        .then((response) => response.text())
        .then((data) => {
          this.handleResult(data)
            .then((result) => {
              resolve(result)
            })
            .catch((result) => {
              reject(result)
            })
        })
        .catch(() => {
          reject({
            status: "failed",
            content: "Connection failed"
          })
        });
    });
  }

  async pinHash(hashToPin, pinataOptions = {}) {
    return new Promise(async (resolve, reject) => {
      const body = {
        hashToPin,
        ...pinataOptions
      }
      
      const options = {
        ...this.options,
        body: JSON.stringify(body),
        method: "POST"
      }
      await fetch("https://api.pinata.cloud/pinning/pinByHash/", options)
        .then((response) => response.text())
        .then((data) => {
          this.handleResult(data)
            .then((result) => {
              resolve(result)
            })
            .catch((result) => {
              reject(result)
            })
        })
        .catch(() => {
          reject({
            status: "failed",
            content: "Connection failed"
          })
        });
    });
  }

  async unpin(hash) {
    return new Promise(async (resolve, reject) => {
      const options = {
        ...this.options,
        method: "DELETE"
      }
      await fetch("https://api.pinata.cloud/pinning/unpin/" + hash, options)
        .then((response) => response.text())
        .then((data) => {
          this.handleResult(data)
            .then((result) => {
              resolve(result)
            })
            .catch((result) => {
              reject(result)
            })
        })
        .catch(() => {
          reject({
            status: "failed",
            content: "Connection failed"
          })
        });
    });
  }

  async getFile(hash) {
    let fileData;
    let fileType;
    await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`)
      .then((res) => res.text())
      .then((data) => {
        try {
          data = JSON.parse(data)
        } catch (err) {
          data = {}
        }
        if ("fileType" in data && "fileData" in data) {
          fileType = data.fileType;
          fileData = data.fileData;
        }
      });
    return fileType ? { fileType, fileData } : { error: "Not found" };
  }

  async pinFile(fileType, fileData, params) {
    return new Promise(async (resolve, reject) => {
      await this.pinJSONToIPFS(
        {
          fileType,
          fileData,
        },
        params
      )
        //.then(async data => await data.json())
        .then(data => resolve(data))
        .catch(() => {
          reject({ error: "Upload fail" })
        })
    })
  }

  async pinJSONToIPFS(data, params = {}) {
    return new Promise(async (resolve, reject) => {
      const options = {
        ...this.options,
        method: "POST",
        body: JSON.stringify({
          pinataMetadata: params,
          pinataContent: data,
        })
      }
      await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", options)
        .then((response) => response.text())
        .then((data) => {
          this.handleResult(data)
            .then((result) => {
              resolve(result)
            })
            .catch((result) => {
              reject(result)
            })
        })
        .catch(() => {
          reject({
            status: "failed",
            content: "Connection failed"
          })
        });
    })
  }

  async pinList(params) {
    return new Promise(async (resolve, reject) => {
      try {
        const options = {
          ...this.options
        }

        const { metadata } = params
        let metadataString = ""

        const firstPartOfQuery = Object.entries(params)
          .filter(([key, value]) => key != "metadata" && value.lenght > 0)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join("&");

        metadataString = metadata.name ? `&metadata[name]=${params.metadata.name}` : "";
        metadataString = metadata.keyvalues ? `${metadataString}&metadata[keyvalues]=${JSON.stringify(metadata.keyvalues)}` : metadataString;

        const query = `https://api.pinata.cloud/data/pinList?${firstPartOfQuery}${metadataString}`

        await fetch(query, options)
          .then((response) => response.text())
          .then((data) => {
            this.handleResult(data)
              .then((result) => {
                resolve(result)
              })
              .catch((result) => {
                reject(result)
              })
          })
          .catch(() => {
            reject({
              status: "failed",
              content: "Connection failed"
            })
          });
      } catch (error) {
        reject({
          status: "failed",
          content: "Operation failed"
        })
      }
    })
  }
}
